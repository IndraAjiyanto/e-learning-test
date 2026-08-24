import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async create(createCategoriesDto: CreateCategoriesDto) {
    const { courseType: courseTypeIds, ...categoryData } = createCategoriesDto;
    const category = await this.categoryRepository.create(categoryData);

    if (courseTypeIds && courseTypeIds.length > 0) {
      const courseTypes =
        await this.courseTypeRepository.findByIds(courseTypeIds);
      category.courseTypes = courseTypes;
    }

    return await this.categoryRepository.save(category);
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
    return await this.categoryRepository.find();
  }

  async findOne(categoryId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['courseTypes'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findCourseByCategory(categoryId: number) {
    return await this.courseRepository.find({
      where: { category: { id: categoryId }, launch: true },
      relations: ['courseType', 'category', 'userCourses'],
    });
  }

  async findCourseByCategoryAll(categoryId: number) {
    return await this.courseRepository.find({
      where: { category: { id: categoryId } },
      relations: ['courseType', 'category', 'userCourses'],
      order: { launch: 'DESC' },
    });
  }

  async findAlumniByCategory(categoryId: number) {
    return await this.alumniRepository.find({
      where: { course: { category: { id: categoryId } } },
      relations: ['course'],
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  async findFaqByCategory(categoryId: number) {
    return await this.faqRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findBenefitByCategory(categoryId: number) {
    return await this.benefitCategoryRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findGalleryByCategory(categoryId: number) {
    const gallery = await this.galleryRepository.find({
      where: { category: { id: categoryId } },
      order: { no: 'ASC' },
      take: 6,
    });

    return gallery.reduce((items, item) => {
      items[Number(item.no) - 1] = item;
      return items;
    }, Array(6).fill(null));
  }

  async findPortfolioByCategory(categoryId: number) {
    return await this.portfolioRepository.find({
      where: { course: { category: { id: categoryId } } },
      relations: ['course', 'course.category'],
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }

  async update(categoryId: number, updateCategoriesDto: UpdateCategoriesDto) {
    const category = await this.findOne(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { courseType: courseTypeIds, ...updateData } = updateCategoriesDto;
    Object.assign(category, updateData);

    if (courseTypeIds !== undefined) {
      if (courseTypeIds.length > 0) {
        const courseTypes =
          await this.courseTypeRepository.findByIds(courseTypeIds);
        category.courseTypes = courseTypes;
      } else {
        category.courseTypes = [];
      }
    }

    return await this.categoryRepository.save(category);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async validateImage(
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

    if (
      options.allowedTypes &&
      !options.allowedTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type not allowed. Only: ${options.allowedTypes.join(', ')}`,
      );
    }
  }

  async validateImageDimensions(
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

  async saveFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'asset',
      folder,
    );

    await fs.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, file.buffer);

    return `/asset/${folder}/${filename}`;
  }

  async remove(categoryId: number) {
    const category = await this.findOne(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoryRepository.remove(category);
    return { message: 'category successfully deleted' };
  }
}
