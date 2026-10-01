import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { Category } from 'src/entities/category.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Partner } from 'src/entities/partner.entity';
import { CategoryPartner } from 'src/entities/category_partner.entity';
import { Benefit } from 'src/entities/benefit.entity';
import { Team } from 'src/entities/team.entity';
import { Social } from 'src/entities/social.entity';
import { About } from 'src/entities/about.entity';
import { Value } from 'src/entities/value.entity';
import { TeamLead } from 'src/entities/team_lead.entity';
import { Vision } from 'src/entities/visions.entity';
import { Commitment } from 'src/entities/commitment.entity';
import { Mission } from 'src/entities/mission.entity';
import { Experience } from 'src/entities/experience.entity';
import { Award } from 'src/entities/award.entity';
import { Background } from 'src/entities/background.entity';
import { Paragraph } from 'src/entities/paragraph.entity';
import { Faq } from 'src/entities/faq.entity';
import { Gallery } from 'src/entities/gallery.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(CategoryPartner)
    private readonly categoryPartnerRepository: Repository<CategoryPartner>,
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Social)
    private readonly socialRepository: Repository<Social>,
    @InjectRepository(About)
    private readonly aboutRepository: Repository<About>,
    @InjectRepository(Value)
    private readonly valueRepository: Repository<Value>,
    @InjectRepository(TeamLead)
    private readonly teamLeadRepository: Repository<TeamLead>,
    @InjectRepository(Vision)
    private readonly visionRepository: Repository<Vision>,
    @InjectRepository(Commitment)
    private readonly commitmentRepository: Repository<Commitment>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(Award)
    private readonly awardRepository: Repository<Award>,
    @InjectRepository(Background)
    private readonly backgroundRepository: Repository<Background>,
    @InjectRepository(Paragraph)
    private readonly paragraphRepository: Repository<Paragraph>,
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
  ) {}

  async findAllCategories() {
    return await this.categoryRepository.find({ order: { createdAt: 'ASC' } });
  }

  async findAllPartners() {
    return await this.partnerRepository.find({
      relations: ['categoryPartner'],
      order: { createdAt: 'ASC' },
    });
  }

  async findAllCourses() {
    return await this.courseRepository.find({
      where: { launch: true },
      order: { createdAt: 'DESC' },
      relations: [
        'category',
        'courseType',
        'userCourses',
        'mentorings',
        'mentorings.user',
      ],
    });
  }

  async findCoursesPaginated(params: {
    userId?: string;
    category?: string;
    courseType?: string;
    method?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseType', 'courseType')
      .leftJoinAndSelect('course.userCourses', 'userCourses')
      // Jumlah peserta sebenarnya. Join `userCourses` di atas ikut tersaring
      // oleh filter userId di bawah, sehingga `userCourses.length` selalu 1
      // untuk student yang sedang login - bar kuota jadi selalu "1 / N".
      // loadRelationCountAndMap memakai subquery sendiri, tidak terpengaruh.
      .loadRelationCountAndMap('course.enrolledCount', 'course.userCourses');

    if (params.userId) {
      // ponytail: My Learning menampilkan program yang diikuti student (launch, learning, done).
      // Jangan kunci pada launch = true karena saat fase learning, launch sengaja false agar pendaftaran publik ditutup.
      query
        .where('userCourses.user.id = :userId', { userId: params.userId })
        .andWhere('(course.status IS NULL OR course.status != :unlaunch)', {
          unlaunch: 'unlaunch',
        });
    } else {
      // Landing page publik: hanya tampilkan program yang pendaftarannya buka
      query.where('course.launch = :launch', { launch: true });
    }

    if (params.category) {
      query.andWhere('category.name = :category', {
        category: params.category,
      });
    }
    if (params.courseType) {
      query.andWhere('courseType.nameClassesType = :courseType', {
        courseType: params.courseType,
      });
    }
    if (params.method) {
      query.andWhere('course.method = :method', { method: params.method });
    }
    if (params.search) {
      query.andWhere('course.name ILIKE :search', {
        search: `%${params.search}%`,
      });
    }

    query
      .orderBy('course.createdAt', 'DESC')
      .skip((params.page - 1) * params.limit)
      .take(params.limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findVisionsMissions() {
    return await this.visionRepository.find();
  }

  async findCommitment() {
    return await this.commitmentRepository.find({
      order: { commitmentOrder: 'ASC' },
    });
  }

  async findValue() {
    return await this.valueRepository.find({ order: { valueOrder: 'ASC' } });
  }

  async findCoursesByMentoring(userId: string) {
    return await this.courseRepository.find({
      where: { mentorings: { user: { id: userId } } },
      relations: [
        'userCourses',
        'category',
        'courseType',
        'mentorings',
        'mentorings.user',
      ],
    });
  }

  async findTeamLead() {
    return await this.teamLeadRepository.find();
  }

  async findMission() {
    return await this.missionRepository.find({
      order: { missionOrder: 'ASC' },
    });
  }

  async findExperience() {
    return await this.experienceRepository.find({
      order: { experienceOrder: 'ASC' },
    });
  }

  async findAward() {
    return await this.awardRepository.find({ order: { awardOrder: 'ASC' } });
  }

  async findAbout() {
    return await this.aboutRepository.find({});
  }

  async findAboutParagraphs() {
    return await this.paragraphRepository.find({
      order: { paragraphOrder: 'ASC' },
    });
  }

  async findBackground() {
    return await this.backgroundRepository.find({
      order: { backgroundOrder: 'ASC' },
    });
  }

  async findCourses() {
    return await this.courseRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['category', 'courseType', 'userCourses'],
    });
  }

  async findPortfolio(options?: {
    userId?: string | null;
    categoryId?: string | null;
    courseTypeId?: string | null;
    search?: string | null;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 6;
    const skip = (page - 1) * limit;

    const qb = this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.course', 'course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseType', 'courseType')
      .leftJoinAndSelect('course.technologies', 'technologies')
      .leftJoinAndSelect('portfolio.user', 'user')
      .orderBy('portfolio.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.userId) {
      qb.andWhere('user.id = :userId', { userId: options.userId });
    }

    if (options?.categoryId) {
      qb.andWhere('category.id = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    if (options?.courseTypeId) {
      qb.andWhere('courseType.id = :courseTypeId', {
        courseTypeId: options.courseTypeId,
      });
    }

    if (options?.search && options.search.trim() !== '') {
      const keyword = `%${options.search.trim()}%`;
      qb.andWhere(
        '(portfolio.title ILIKE :keyword OR portfolio.description ILIKE :keyword OR user.username ILIKE :keyword OR course.name ILIKE :keyword)',
        { keyword },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findAlumni(options?: {
    courseId?: string | null;
    search?: string | null;
    categoryId?: string | null;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 6;
    const skip = (page - 1) * limit;

    const qb = this.alumniRepository
      .createQueryBuilder('alumni')
      .leftJoinAndSelect('alumni.course', 'course')
      .leftJoinAndSelect('course.category', 'category')
      .orderBy('alumni.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.courseId) {
      qb.andWhere('course.id = :courseId', { courseId: options.courseId });
    } else if (options?.categoryId) {
      qb.andWhere('category.id = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    // Pencarian nama & posisi saat ini (kolom jsonb -> cast ke text agar ILIKE valid)
    if (options?.search && options.search.trim() !== '') {
      const keyword = `%${options.search.trim()}%`;
      qb.andWhere(
        '(alumni.name::text ILIKE :keyword OR alumni."currentPosition"::text ILIKE :keyword)',
        {
          keyword,
        },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async findAllAlumni() {
    return await this.alumniRepository.find({
      relations: ['course'],
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  /**
   * Sampel alumni acak untuk pop-up alumni mengambang.
   *
   * Berbeda dengan `findAlumni` yang mengurutkan `createdAt` untuk daftar
   * direktori, di sini urutannya justru diacak: pop-up muncul di setiap page
   * load, jadi selalu membuka alumni yang berbeda supaya tidak terasa seperti
   * billboard alumni yang sama berulang-ulang. `RANDOM()` sudah dipakai di
   * `courses.service.ts` untuk kebutuhan acak yang sama.
   *
   * Pengambilan dilakukan dua tahap, bukan satu query dengan join:
   * `getMany()` yang memakai `take()` dan `leftJoinAndSelect` menjalankan
   * query kedua berbentuk `SELECT DISTINCT "distinctAlias"."alumni_id" ...`
   * untuk mengambil ID-nya, dan di situ alias `RANDOM()` tidak ikut ke select
   * list - Postgres menolaknya dengan "for SELECT DISTINCT, ORDER BY
   * expressions must appear in select list". `addSelect('RANDOM()', 'rand')`
   * tidak menolong karena select list di query ID itulah yang jadi tempat
   * ORDER BY dinilai.
   *
   * Jadi tahap pertama ambil ID acak tanpa join sama sekali (tidak ada
   * `distinctAlias` kalau tidak ada relasi), tahap kedua ambil entitas untuk
   * ID itu, lalu urutannya dipulihkan di memori mengikuti urutan acak tadi.
   */
  async findRandomAlumni(limit: number) {
    const idRows = await this.alumniRepository
      .createQueryBuilder('alumni')
      .select('alumni.id', 'id')
      .addSelect('RANDOM()', 'rand')
      .orderBy('"rand"', 'ASC')
      .limit(limit)
      .getRawMany<{ id: string }>();

    if (idRows.length === 0) return [];

    const ids = idRows.map((row) => row.id);
    const alumni = await this.alumniRepository.find({
      where: { id: In(ids) },
      relations: ['course', 'course.category'],
    });

    const byId = new Map(alumni.map((item) => [item.id, item]));

    return ids
      .map((id) => byId.get(id))
      .filter((item): item is Alumni => item !== undefined);
  }

  // async findPortfolio() {
  //   return await this.portfolioRepository.find({
  //     relations: ['course', 'course.category', 'course.courseType', 'user'],
  //   });
  // }

  async findOnePortfolio(portfolioId: string) {
    return await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['course', 'course.category', 'course.technologies', 'user'],
    });
  }

  async findFAQ() {
    return await this.faqRepository.find();
  }

  // async findAlumni() {
  //   return await this.alumniRepository.find({
  //     relations: ['course'],
  //     order: { createdAt: 'DESC' },
  //     take: 6,
  //   });
  // }

  async findCollaborations() {
    return await this.partnerRepository.find({
      relations: ['categoryPartner'],
      order: { createdAt: 'ASC' },
    });
  }

  async findCategoryPartners() {
    return await this.categoryPartnerRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findTeam() {
    return await this.teamRepository.find({
      order: { teamOrder: 'ASC' },
    });
  }

  async findSocial() {
    return await this.socialRepository.find();
  }

  async findSpecialProgram() {
    return await this.categoryRepository.find({
      where: { type: 'Special Program' },
    });
  }

  async findOneCategory(kategoriName: string) {
    return await this.categoryRepository.findOne({
      where: { name: kategoriName },
      relations: ['courses', 'courses.alumni', 'faqs'],
    });
  }

  async findCategories() {
    return await this.categoryRepository.find();
  }

  async findAllBenefits() {
    return await this.benefitRepository.find({ order: { no: 'ASC' } });
  }

  async findBenefit1() {
    return await this.benefitRepository.findOne({ where: { no: 1 } });
  }

  async findBenefit2() {
    return await this.benefitRepository.findOne({ where: { no: 2 } });
  }

  async findBenefit3() {
    return await this.benefitRepository.findOne({ where: { no: 3 } });
  }

  async findCourseTypes() {
    return await this.courseTypeRepository.find();
  }

  async findAllGallery(): Promise<Gallery[]> {
    return this.galleryRepository.find({
      relations: ['category'],
      order: { no: 'ASC' },
    });
  }
}
