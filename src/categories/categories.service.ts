import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { CategoryFaq } from 'src/entities/faqs.entity';
import { BenefitCategory } from 'src/entities/benefit_category.entity';
import { Gallery } from 'src/entities/gallery.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { imageSize } from 'image-size';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(CategoryFaq)
    private readonly faqRepository: Repository<CategoryFaq>,
    @InjectRepository(BenefitCategory)
    private readonly benefitCategoryRepository: Repository<BenefitCategory>,
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,
  ) {}

  // Nomor urut (1..N) untuk mengurutkan kategori di navbar user. Nilainya
  // dikirim form sebagai string (multipart, tanpa global ValidationPipe), jadi
  // di-coerce di sini. `required` = wajib saat create.
  private parseNo(value: unknown, required: boolean): number | undefined {
    if (value === undefined || value === null || value === '') {
      if (required) {
        throw new BadRequestException('Category order number is required.');
      }
      return undefined;
    }

    const no = Number(value);
    if (!Number.isInteger(no) || no < 1) {
      throw new BadRequestException(
        'Category order number must be a positive integer.',
      );
    }
    return no;
  }

  async count() {
    return await this.categoryRepository.count();
  }

  async getTakenNumbers(excludeId?: string) {
    const qb = this.categoryRepository
      .createQueryBuilder('c')
      .select('c.no', 'no')
      .where('c.no IS NOT NULL');
    if (excludeId) {
      qb.andWhere('c.id != :excludeId', { excludeId });
    }
    const rows: { no: number | null }[] = await qb.getRawMany<{
      no: number | null;
    }>();
    return rows
      .map((r) => r.no)
      .filter((n): n is number => n !== null && n !== undefined)
      .sort((a, b) => a - b);
  }

  async create(createCategoriesDto: CreateCategoriesDto) {
    const {
      courseType: courseTypeIds,
      no,
      ...categoryData
    } = createCategoriesDto;
    this.normalizeLangNames(categoryData);
    const targetNo = this.parseNo(no, true) as number;

    // Transaksi: geser kategori dengan no >= target ke +1, lalu simpan yang baru
    // di posisi target. Menjaga urutan rapat 1..N tanpa duplikat/gap.
    return await this.categoryRepository.manager.transaction(
      async (manager) => {
        await manager.query(
          `UPDATE "category" SET "no" = "no" + 1 WHERE "no" >= $1`,
          [targetNo],
        );

        const category = manager.create(Category, {
          ...categoryData,
          no: targetNo,
        });

        if (courseTypeIds && courseTypeIds.length > 0) {
          category.courseTypes =
            await this.courseTypeRepository.findByIds(courseTypeIds);
        }

        return manager.save(category);
      },
    );
  }

  async findOneCategory(categoryName: string) {
    const category = await this.categoryRepository.findOne({
      where: { name: categoryName },
      relations: ['courseTypes'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findCourseTypes() {
    return await this.courseTypeRepository.find();
  }

  async findAll() {
    // Urutan harus eksplisit: tanpa ini Postgres mengembalikan baris sesuai
    // urutan fisiknya, dan sebuah UPDATE memindahkan baris yang diedit ke
    // belakang — daftar teracak dan nomor barisnya ikut berubah (lihat TC-045).
    return await this.categoryRepository.find({
      relations: ['courses'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['courseTypes'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  /**
   * Program untuk section "program" di halaman detail category.
   *
   * Hanya program yang statusnya Published/launch yang dikirim ke view
   * (launch = true ATAU status = 'launch'; keduanya biasanya sinkron, tapi
   * jalur updateLaunch lama hanya mengubah kolom launch). Jika hasilnya
   * kosong, section program dirender sebagai Coming Soon.
   */
  async findCourseByCategory(categoryId: string) {
    return await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.courseType', 'courseType')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.userCourses', 'userCourses')
      .where('category.id = :categoryId', { categoryId })
      .andWhere('(course.launch = :launch OR course.status = :status)', {
        launch: true,
        status: 'launch',
      })
      .getMany();
  }

  async findCourseByCategoryAll(categoryId: string) {
    return await this.courseRepository.find({
      where: { category: { id: categoryId } },
      relations: ['courseType', 'category', 'userCourses'],
      order: { launch: 'DESC' },
    });
  }

  async findAlumniByCategory(categoryId: string) {
    return await this.alumniRepository.find({
      where: { course: { category: { id: categoryId } } },
      relations: ['course', 'course.category'],
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  async findFaqByCategory(categoryId: string) {
    return await this.faqRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findBenefitByCategory(categoryId: string) {
    return await this.benefitCategoryRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findGalleryByCategory(categoryId: string) {
    const gallery = await this.galleryRepository.find({
      where: { category: { id: categoryId } },
      order: { no: 'ASC' },
      take: 6,
    });

    const initial: ((typeof gallery)[number] | null)[] = [
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    return gallery.reduce((items, item) => {
      items[Number(item.no) - 1] = item;
      return items;
    }, initial);
  }

  async findPortfolioByCategory(categoryId: string) {
    return await this.portfolioRepository.find({
      where: { course: { category: { id: categoryId } } },
      relations: ['course', 'course.category'],
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }

  async update(categoryId: string, updateCategoriesDto: UpdateCategoriesDto) {
    const category = await this.findOne(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const {
      courseType: courseTypeIds,
      no,
      ...updateData
    } = updateCategoriesDto;
    this.normalizeLangNames(updateData);

    const oldNo = category.no;
    const newNo = this.parseNo(no, false) ?? oldNo;

    return await this.categoryRepository.manager.transaction(
      async (manager) => {
        // Auto geser saat nomor berubah: menutup celah di posisi lama, membuka
        // celah di posisi baru. Baris lama yang masih NULL tidak digeser.
        if (
          newNo !== undefined &&
          newNo !== null &&
          oldNo !== null &&
          newNo !== oldNo
        ) {
          if (newNo < oldNo) {
            await manager.query(
              `UPDATE "category" SET "no" = "no" + 1 WHERE "no" >= $1 AND "no" < $2`,
              [newNo, oldNo],
            );
          } else {
            await manager.query(
              `UPDATE "category" SET "no" = "no" - 1 WHERE "no" > $1 AND "no" <= $2`,
              [oldNo, newNo],
            );
          }
        }

        Object.assign(category, updateData);
        if (newNo !== undefined) category.no = newNo;

        if (courseTypeIds !== undefined) {
          category.courseTypes =
            courseTypeIds.length > 0
              ? await this.courseTypeRepository.findByIds(courseTypeIds)
              : [];
        }

        return manager.save(category);
      },
    );
  }

  // Form selalu mengirim name_en/name_ja (bisa berupa string kosong). Jadikan
  // null supaya kolom nullable tetap bersih dan helper view yang membaca
  // nameByLang tidak pernah bertemu '' — fallback ke `name` memakai falsy.
  private normalizeLangNames(data: {
    name_en?: string | null;
    name_ja?: string | null;
  }) {
    data.name_en = data.name_en?.trim() || null;
    data.name_ja = data.name_ja?.trim() || null;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch {
      // ignore
    }
  }

  validateImage(
    file: Express.Multer.File,
    options: {
      maxSize: number;
      allowedTypes: string[];
    },
  ) {
    if (!file || file.size === 0) return;

    if (options.maxSize && file.size > options.maxSize) {
      throw new BadRequestException(
        `File size too large. Maximum ${(options.maxSize / 1024 / 1024).toFixed(0)}MB`,
      );
    }

    if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Only: ${options.allowedTypes.join(', ')}`,
      );
    }
  }

  validateImageDimensions(
    file: Express.Multer.File,
    options: {
      minWidth: number;
      maxWidth: number;
      minHeight: number;
      maxHeight: number;
    },
  ) {
    if (!file || file.size === 0) return;

    try {
      const dimensions = imageSize(file.buffer);

      if (!dimensions.width || !dimensions.height) {
        throw new BadRequestException('Could not determine image dimensions');
      }

      if (
        dimensions.width < options.minWidth ||
        dimensions.width > options.maxWidth ||
        dimensions.height < options.minHeight ||
        dimensions.height > options.maxHeight
      ) {
        throw new BadRequestException(
          `Image dimensions ${dimensions.width}x${dimensions.height}px. Required: ${options.minWidth}x${options.minHeight} to ${options.maxWidth}x${options.maxHeight} pixels`,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid or corrupted image file');
    }
  }

  async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'public', 'asset', folder);

    await fs.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, file.buffer);

    return `/asset/${folder}/${filename}`;
  }

  async remove(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['courses'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const programCount = category.courses?.length || 0;
    if (programCount > 0) {
      throw new BadRequestException(
        `Category "${category.name}" cannot be deleted because it still has ${programCount} program(s). Please move or delete the programs first.`,
      );
    }
    const removedNo = category.no;
    await this.categoryRepository.manager.transaction(async (manager) => {
      await manager.remove(category);
      // Rapatkan nomor urut setelah penghapusan (menjaga count == max no).
      if (removedNo !== null && removedNo !== undefined) {
        await manager.query(
          `UPDATE "category" SET "no" = "no" - 1 WHERE "no" > $1`,
          [removedNo],
        );
      }
    });
    return { message: 'category successfully deleted' };
  }
}
