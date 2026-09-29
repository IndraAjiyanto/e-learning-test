import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portofolios } from 'src/entities/portofolios.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { CourseType } from 'src/entities/course_type.entity';
import * as ps from 'fs/promises';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
  ) {}
  async create(createPortfolioDto: CreatePortfolioDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPortfolioDto.userId },
    });
    const course = await this.courseRepository.findOne({
      where: { id: createPortfolioDto.courseId },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (!course) {
      throw new NotFoundException('course not found');
    }

    // Portfolio hanya bermakna sebagai karya seorang student di program yang
    // dia ikuti. Tanpa baris ini `courseId` bebas diisi program mana saja:
    // karyanya masuk ke galeri program yang tidak dia ikuti, dan saat program
    // itu dibuka student lain, karya ini muncul sebagai milik orang yang
    // seharusnya tidak ada di sana.
    if (!(await this.isEnrolledInCourse(user.id, course.id))) {
      throw new ForbiddenException(
        'You can only add a portfolio to a program you are enrolled in.',
      );
    }

    // Satu portfolio per student per program. Tanpa penjagaan ini student bisa
    // membuat portfolio kedua untuk program yang sama hanya dengan mengirim
    // ulang POST, dan galeri program kemudian menampilkan karyanya dua kali.
    const existing = await this.portfolioRepository.findOne({
      where: {
        user: { id: user.id },
        course: { id: course.id },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'You already have a portfolio for this program. Edit the one you have instead of creating another.',
      );
    }

    const portfolio = await this.portfolioRepository.create({
      ...createPortfolioDto,
      user: user,
      course: course,
    });

    return await this.portfolioRepository.save(portfolio);
  }

  /**
   * Portfolio milik sebuah program, lengkap dengan penulisnya - ini yang
   * dirender tab Portfolio di halaman Start Learning, bukan hanya karyanya
   * sendiri. Urutannya dibalik supaya yang baru diunggah muncul di atas.
   *
   * Daftar kolom dipilih satu per satu, dan itu bukan sekadar penghematan:
   * panel ini mengirim datanya ke HTML sebagai pulau JSON, jadi apa pun yang
   * ada di sini ikut terkirim ke peramban setiap student yang mengikuti
   * program itu. Dengan `relations: ['user']` biasa, seluruh baris user ikut
   * terbawa - termasuk `password`, `resetPasswordToken`, dan
   * `verificationToken`. `@Exclude()` di entitas tidak menolong di sini,
   * karena yang dipakai adalah `JSON.stringify`, bukan class-transformer.
   * Yang boleh keluar hanya kolom yang memang ditampilkan di kartu.
   *
   * CATATAN: nama yang salah di `.select()` di sini tidak throws - TypeORM
   * memakainya sebagai SQL mentah, dan Postgres baru menolak saat query
   * berjalan (`missing FROM-clause entry for table ...`). `courseType.name`
   * dulu begitu, padahal kolomnya `nameClassesType`. Jadi kalau menambah kolom
   * select, cek dulu namanya ke entitas.
   */
  async findByCourse(courseId: string, currentUserId?: string) {
    if (!courseId) {
      return [];
    }

    const items = await this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.user', 'user')
      .leftJoinAndSelect('portfolio.course', 'course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseType', 'courseType')
      .leftJoinAndSelect('course.technologies', 'technology')
      .select([
        'portfolio.id',
        'portfolio.title',
        'portfolio.description',
        'portfolio.link',
        'portfolio.content',
        'portfolio.contentHtml',
        'portfolio.image',
        'portfolio.createdAt',
        'user.id',
        'user.username',
        'user.email',
        'user.profile',
        'course.id',
        'course.name',
        'category.id',
        'category.name',
        'courseType.id',
        'courseType.nameClassesType',
        'technology.id',
        'technology.name',
        'technology.svg',
        'technology.imgUrl',
      ])
      .where('course.id = :courseId', { courseId })
      .orderBy('portfolio.createdAt', 'DESC')
      .getMany();

    // Bentuk kiriman dirakit di sini, bukan spreading entity, supaya kolom
    // portfolio yang belum diproyeksikan tidak ikut terbawa diam-diam.
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      link: item.link,
      content: item.content,
      contentHtml: item.contentHtml,
      image: item.image,
      createdAt: item.createdAt,
      user: item.user,
      course: item.course ? this.mapCourseForPanel(item.course) : null,
      // Ditentu di server dari user yang sedang login, bukan dari kiriman
      // peramban: partial memakai `isMine` untuk x-show tombol ubah/hapus dan
      // untuk menghitung "portfolio saya". Kalau client yang menentukan, satu
      // student bisa menandai karya orang lain sebagai miliknya.
      isMine: !!currentUserId && item.user?.id === currentUserId,
    }));
  }

  /**
   * Bentuk program yang dikirim ke panel Portfolio.
   *
   * Dipetakan eksplisit, bukan spreading entity, karena island JSON ini
   * dikirim ke semua student yang mengikuti program itu: kalau nanti ada kolom
   * program yang bertambah, dia ikut terkirim tanpa disengaja. Nama kolom
   * program type memang `nameClassesType` (lihat entitas CourseType), jadi
   * di sini dibikin `name` supaya template tidak perlu tahu nama itu - dan
   * `icon`/`description` program type tidak ikut ke peramban.
   */
  private mapCourseForPanel(course: Course) {
    return {
      id: course.id,
      name: course.name,
      category: course.category
        ? { id: course.category.id, name: course.category.name }
        : null,
      courseType: course.courseType
        ? { id: course.courseType.id, name: course.courseType.nameClassesType }
        : null,
      technologies: (course.technologies || []).map((tech) => ({
        id: tech.id,
        name: tech.name,
        svg: tech.svg,
        imgUrl: tech.imgUrl,
      })),
    };
  }

  /**
   * Program untuk kepala panel: nama program yang sedang dibuka, tipenya,
   * dan kategorinya. Tanpa ini, panel harus menebak nama program dari
   * portfolio yang kebetulan ada - dan program yang belum punya portfolio jadi
   * tidak punya nama sama sekali.
   *
   * Yang diproyeksikan sama seperti `findByCourse`: `description`, `criteria*`,
   * dan kolom lain milik program tidak dibutuhkan panel, dan tidak perlu ikut
   * ke peramban.
   */
  async findCourseForPortfolio(courseId: string) {
    if (!courseId) {
      return null;
    }

    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseType', 'courseType')
      .select([
        'course.id',
        'course.name',
        'category.id',
        'category.name',
        'courseType.id',
        'courseType.nameClassesType',
      ])
      .where('course.id = :courseId', { courseId })
      .getOne();

    return course ? this.mapCourseForPanel(course) : null;
  }

  /**
   * Student hanya boleh melihat galeri program yang ia ikuti. Tanpa ini
   * `courseId` pada rute fragment bisa diisi program mana saja dan isi
   * program orang lain terbuka.
   */
  async isEnrolledInCourse(userId: string, courseId?: string) {
    if (!courseId) {
      return false;
    }

    const count = await this.courseRepository
      .createQueryBuilder('course')
      .innerJoin(
        'course.userCourses',
        'userCourses',
        'userCourses.userId = :userId',
        { userId },
      )
      .where('course.id = :courseId', { courseId })
      .getCount();

    return count > 0;
  }

  async findByUser(userId: string) {
    return await this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: [
        'course',
        'course.category',
        'course.courseType',
        'course.technologies',
      ],
    });
  }

  async findCategory() {
    return await this.categoryRepository.find();
  }

  async findCourseTypes() {
    return await this.courseTypeRepository.find();
  }

  async findCategoryMyPortfolio(userId: string) {
    return await this.categoryRepository.find({
      where: { courses: { userCourses: { user: { id: userId } } } },
    });
  }

  async findMyPortfolioCourseTypes(userId: string) {
    return await this.courseTypeRepository.find({
      where: { classes: { userCourses: { user: { id: userId } } } },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 6,
    categoryId?: string,
    courseTypeId?: string,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.course', 'course')
      .leftJoinAndSelect('portfolio.user', 'user')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseType', 'courseType');

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (courseTypeId) {
      queryBuilder.andWhere('courseType.id = :courseTypeId', { courseTypeId });
    }

    const total = await queryBuilder.getCount();

    const items = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('portfolio.createdAt', 'DESC')
      .getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(portfolioId: string) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['course', 'course.technologies'],
    });
    if (!portfolio) {
      throw new NotFoundException('portfolio not found');
    }
    return portfolio;
  }

  /**
   * Satu-satunya cara controller boleh mengubah atau menghapus portfolio.
   *
   * Galeri program menampilkan karya semua student, jadi `findOne` biasa
   * tidak bisa dipakai di sini: tanpa syarat penulis, siapa pun yang tahu
   * sebuah id bisa menyunting atau menghapus karya student lain. Syaratnya
   * ditulis di dalam query, jadi tidak ada celah antara "dibaca" dan
   * "diubah".
   *
   * Relasi `user` sengaja tidak dimuat: `findOne` dipakai juga untuk
   * merender halaman, dan memuat user di sini berarti seluruh baris
   * user ikut terbawa ke view.
   */
  async findOwnedOne(portfolioId: string, userId?: string) {
    if (!userId) {
      throw new ForbiddenException(
        'This portfolio belongs to another student. You can only change your own.',
      );
    }

    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId, user: { id: userId } },
      relations: ['course', 'course.technologies'],
    });

    if (!portfolio) {
      throw new ForbiddenException(
        'This portfolio belongs to another student. You can only change your own.',
      );
    }

    return portfolio;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await ps.unlink(filePath);
    } catch (error) {}
  }

  // Mengembalikan isi EditorJS dalam bentuk yang selalu bisa diproses di
  // bawah ini: objek dengan array `blocks`. Teks polos (atau apa pun yang
  // bukan JSON) diperlakukan sebagai satu blok paragraph.
  private parseEditorJsContent(isi: string): { blocks: any[]; [key: string]: any } {
    const text = typeof isi === 'string' ? isi : '';

    try {
      const parsed = JSON.parse(text) as unknown;
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        Array.isArray((parsed as { blocks?: unknown }).blocks)
      ) {
        return parsed as { blocks: any[]; [key: string]: any };
      }
    } catch {
      // Bukan JSON. Teks polosnya dibungkus menjadi satu blok paragraph di
      // bawah, jadi isi student tidak hilang diam-diam.
    }

    return {
      time: Date.now(),
      blocks: text.trim() ? [{ type: 'paragraph', data: { text } }] : [],
    };
  }

  async ChangeImageEditorJS(
    isi: string,
    oldFolder: string,
    newFolder: string,
    deleteFileInFolder?: string,
  ): Promise<string> {
    // EditorJS memang mengirim JSON, tapi ada dua jalan yang bisa mengirim
    // teks polos: textarea cadangan yang muncul saat EditorJS gagal dimuat,
    // dan baris lama yang isinya bukan JSON EditorJS. `JSON.parse` tanpa
    // penjaga membuat keduanya jadi 500, jadi teks polos dibungkus jadi satu
    // blok paragraph - isinya tetap tersimpan dan bentuknya tetap valid.
    const editorjsData = this.parseEditorJsContent(isi);

    const tempDir = path.join(process.cwd(), 'public' + oldFolder);
    const finalDir = path.join(process.cwd(), 'public' + newFolder);

    // Folder tujuan harus dibuat lebih dulu. `public/` diabaikan git dan tidak
    // ada yang membuatnya, jadi di mesin yang belum pernah menyimpan portfolio
    // ber gambar di editor, `rename` ke sini gagal ENOENT - dan penjaga
    // `existsSync(oldPath)` di bawah tidak menangkapnya, karena yang diperiksa
    // hanya file sumber, bukan folder tujuan.
    fs.mkdirSync(finalDir, { recursive: true });

    editorjsData.blocks.forEach((block: any) => {
      if (block.type === 'image' && block.data?.file?.url) {
        const oldUrl = block.data.file.url;

        const fileName = oldUrl.split('/').pop();

        const oldPath = path.join(tempDir, fileName);
        const newPath = path.join(finalDir, fileName);

        if (fs.existsSync(oldPath)) {
          // `rename` lintas device (temp dan isi bisa berada di mount berbeda)
          // melempar EXDEV; `copyFile` + `unlink` menyelesaikan pemindahan yang
          // sama dan tidak menggagalkan penyimpanan portfolio.
          try {
            fs.renameSync(oldPath, newPath);
          } catch (err: any) {
            if (err.code !== 'EXDEV') throw err;
            fs.copyFileSync(oldPath, newPath);
            fs.unlinkSync(oldPath);
          }
        }

        block.data.file.url = `${newFolder}/${fileName}`;
      }
    });

    if (deleteFileInFolder) {
      const deleteDir = path.join(process.cwd(), 'public' + deleteFileInFolder);

      if (fs.existsSync(deleteDir)) {
        const files = fs.readdirSync(deleteDir);

        files.forEach((file) => {
          const filePath = path.join(deleteDir, file);

          if (fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        });
      }
    }

    return JSON.stringify(editorjsData);
  }

  async update(portfolioId: string, updatePortfolioDto: UpdatePortfolioDto) {
    await this.portfolioRepository.update(portfolioId, updatePortfolioDto);
  }

  async deleteUnusedImages(oldImage: string[], newImage: string[]) {
    const publicDir = path.join(process.cwd(), 'public');

    const fileToDelete = oldImage.filter(
      (oldPath) => !newImage.includes(oldPath),
    );

    await Promise.all(
      fileToDelete.map(async (dbPath) => {
        try {
          const fullPath = path.join(publicDir, dbPath);
          await ps.unlink(fullPath);
        } catch (err) {}
      }),
    );

    return newImage;
  }

  async remove(portfolio: Portofolios) {
    return await this.portfolioRepository.remove(portfolio);
  }
}
