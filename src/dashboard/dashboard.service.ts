import { Repository, ILike } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { ImageBenefit } from 'src/entities/image_benefit.entity';
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
import { OurExperience } from 'src/entities/our_experience.entity';
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
    @InjectRepository(ImageBenefit)
    private readonly imageBenefitRepository: Repository<ImageBenefit>,
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
    @InjectRepository(OurExperience)
    private readonly ourExperienceRepository: Repository<OurExperience>,
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
  ) {}

  async findAllCategories() {
    return await this.categoryRepository.find({ order: { id: 'ASC' } });
  }

  async findAllPartners() {
    return await this.partnerRepository.find({
      relations: ['categoryPartner'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOurExperience() {
    return await this.ourExperienceRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findAllCourses() {
    return await this.courseRepository.find({
      where: { launch: true },
      order: { id: 'DESC' },
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
    userId?: number;
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
      .where('course.launch = :launch', { launch: true });

    if (params.userId) {
      query.andWhere('userCourses.user.id = :userId', {
        userId: params.userId,
      });
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
      .orderBy('course.id', 'DESC')
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

  async findCoursesByMentoring(userId: number) {
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
      order: { id: 'DESC' },
      relations: ['category', 'courseType', 'userCourses'],
    });
  }

  async findPortfolio(options?: {
    userId?: number | null;
    categoryId?: string | null;
    courseTypeId?: string | null;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 6;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.userId) {
      where.user = { id: options.userId };
    }

    if (options?.categoryId) {
      where.course = {
        ...where.course,
        category: { id: options.categoryId },
      };
    }

    if (options?.courseTypeId) {
      where.course = {
        ...where.course,
        courseType: { id: options.courseTypeId },
      };
    }

    const [data, total] = await this.portfolioRepository.findAndCount({
      where,
      relations: ['course', 'course.category', 'course.courseType', 'user'],
      skip,
      take: limit,
    });

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

    // const qb = this.alumniRepository
    //   .createQueryBuilder('alumni')
    //   .leftJoinAndSelect('alumni.kelas', 'kelas')
    //   .leftJoinAndSelect('kelas.kategori', 'kategori')
    //   .orderBy('alumni.createdAt', 'DESC')
    //   .skip(skip)
    //   .take(limit);

    const where: any = {};

    // Logika filter course atau category global
    if (options?.courseId) {
      where.course = { id: options.courseId };
    } else if (options?.categoryId) {
      where.course = { category: { id: options.categoryId } };
    }
    if (options?.search && options.search.trim() !== '') {
      const keyword = `%${options.search.trim()}%`;
      where.nama = ILike(keyword);
    }

    const [data, total] = await this.alumniRepository.findAndCount({
      where,
      relations: ['course', 'course.category'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async findAllAlumni() {
    return await this.alumniRepository.find({
      relations: ['course'],
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  // async findPortfolio() {
  //   return await this.portfolioRepository.find({
  //     relations: ['course', 'course.category', 'course.courseType', 'user'],
  //   });
  // }

  async findOnePortfolio(portfolioId: number) {
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

  async findImage1() {
    return await this.imageBenefitRepository.findOne({ where: { no: 1 } });
  }

  async findImage2() {
    return await this.imageBenefitRepository.findOne({ where: { no: 2 } });
  }

  async findImage3() {
    return await this.imageBenefitRepository.findOne({ where: { no: 3 } });
  }

  async findImage4() {
    return await this.imageBenefitRepository.findOne({ where: { no: 4 } });
  }

  async findAllGallery(): Promise<Gallery[]> {
      return this.galleryRepository.find({
        relations: ['category'],
        order: { id: 'DESC' },
      });
    }
}
