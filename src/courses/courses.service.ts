import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCoursesDto } from './dto/create-courses.dto';
import { UpdateCoursesDto } from './dto/update-courses.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { In, IsNull, Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Session } from 'src/entities/session.entity';
import { Category } from 'src/entities/category.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Payment } from 'src/entities/payment.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Mentors } from 'src/entities/mentor.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Technology } from 'src/entities/technology.entity';
import { Mentorings } from 'src/entities/mentoring.entity';
import { Registration } from 'src/entities/registration.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { CourseQuestions } from 'src/entities/course_question.entity';
import { ProgramBenefits } from 'src/entities/course_benefit.entity';
import { CourseFlow } from 'src/entities/course_flow.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Installment } from 'src/entities/installment.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Portofolios } from 'src/entities/portofolios.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
    @InjectRepository(Weeks)
    private readonly weeksRepository: Repository<Weeks>,
    @InjectRepository(WeekProgress)
    private readonly weekProgressRepository: Repository<WeekProgress>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(SessionProgress)
    private readonly sessionProgressRepository: Repository<SessionProgress>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(Logbook)
    private readonly logbookRepository: Repository<Logbook>,
    @InjectRepository(MentorLogbook)
    private readonly mentorLogbookRepository: Repository<MentorLogbook>,
    @InjectRepository(Technology)
    private readonly technologiesRepository: Repository<Technology>,
    @InjectRepository(Mentorings)
    private readonly mentoringRepository: Repository<Mentorings>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(CourseQuestions)
    private readonly courseQuestionRepository: Repository<CourseQuestions>,
    @InjectRepository(ProgramBenefits)
    private readonly programBenefitRepository: Repository<ProgramBenefits>,
    @InjectRepository(CourseFlow)
    private readonly courseFlowRepository: Repository<CourseFlow>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(Installment)
    private readonly installmentsRepository: Repository<Installment>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,
  ) {}

  async findOneCategory(categoryId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('category not Found');
    }
    return category;
  }

  async findNo(courseId: number) {
    const installment = await this.findCourseInstallments(courseId);
    const usedNumbers = installment.map((i) => Number(i.month));
      
    const availableNumbers = [3, 6, 12].filter(
      (n) => !usedNumbers.includes(n)
    );
    return availableNumbers;
  }

  async create(createCourseDto: CreateCoursesDto) {

    if (!createCourseDto.image || createCourseDto.image.trim() === '') {
    throw new BadRequestException('Image file is required');
  }

    const category = await this.categoryRepository.findOne({
      where: { id: createCourseDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('category not Found');
    }
    const courseType = await this.courseTypeRepository.findOne({
      where: { id: createCourseDto.courseTypeId },
    });
    if (!courseType) {
      throw new NotFoundException('type program not Found');
    }

    let technologies: Technology[] = [];
    if (
      createCourseDto.technologiesIds &&
      createCourseDto.technologiesIds.length > 0
    ) {
      technologies = await this.technologiesRepository.findBy({
        id: In(createCourseDto.technologiesIds),
      });
    }

    const course = await this.courseRepository.create({
      ...createCourseDto,
      category: category,
      courseType: courseType,
      technologies: technologies,
    });
    return await this.courseRepository.save(course);
  }

  async createMentoring(userId: number, courseId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: 'admin' },
    });
    if (!user) {
      throw new NotFoundException('User not Found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not Found');
    }

    const mentorings = await this.mentoringRepository.create({
      course: course,
      user: user,
    });
    return await this.mentoringRepository.save(mentorings);
  }

  async updateMentoring(userId: number, courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Program not Found');
    }

    const newMentorUser = await this.userRepository.findOne({
      where: { id: userId, role: 'admin' },
    });

    if (!newMentorUser) {
      throw new NotFoundException(`Mentors not Found`);
    }

    const existingMentoring = await this.mentoringRepository.findOne({
      where: { course: { id: courseId } },
      relations: ['course', 'user'],
    });

    if (existingMentoring) {
      existingMentoring.user = newMentorUser;
      return await this.mentoringRepository.save(existingMentoring);
    } else {
      const newMentoring = this.mentoringRepository.create({
        user: newMentorUser,
        course: course,
      });
      return await this.mentoringRepository.save(newMentoring);
    }
  }

  async addUserToCourse(userId: number, courseId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['weeks', 'weeks.session'],
    });
    if (!course) {
      throw new NotFoundException('Program Not Found');
    }

    const alreadyJoined = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (alreadyJoined) {
      throw new BadRequestException('User already joined the program');
    }

    if (course.checkPaid === true) {
      const daftar = await this.paymentRepository.find({
        where: { course: { id: courseId }, process: 'process' },
      });

      const gabung = await this.userRepository.find({
        where: { userCourses: { course: { id: courseId } } },
      });
      const totalUsers = daftar.length + gabung.length;

      if (totalUsers >= course.quota) {
        throw new BadRequestException('The program is currently full');
      }

      const userCourses = await this.userCourseRepository.create({
        progress: false,
        user: user,
        course: course,
      });

      await this.userCourseRepository.save(userCourses);

      if (course.weeks.length > 0) {
        const weeks = await this.weeksRepository.findOne({
          where: { course: { id: courseId }, weekNumber: 1 },
          relations: ['session'],
        });
        const lastWeek = await this.weeksRepository.findOne({
          where: { course: { id: courseId }, isFinal: true },
        });
        if (weeks) {
          const existingProgresMinggu =
            await this.weekProgressRepository.findOne({
              where: { week: { id: weeks.id }, user: { id: userId } },
            });
          if (existingProgresMinggu) {
            await this.weekProgressRepository.save({
              id: existingProgresMinggu.id,
              weeks: weeks,
              user: user,
              proses: true,
              quiz: false,
            });
          } else {
            await this.weekProgressRepository.save({
              weeks: weeks,
              user: user,
              proses: true,
              quiz: false,
            });
          }

          const session = await this.sessionRepository.findOne({
            where: { weeks: { id: weeks.id }, sessionOrder: 1 },
            relations: [],
          });
          if (session) {
            const existingSessionProgress =
              await this.sessionProgressRepository.findOne({
                where: {
                  session: { id: session.id },
                  user: { id: userId },
                },
              });
            if (existingSessionProgress) {
              await this.sessionProgressRepository.save({
                id: existingSessionProgress.id,
                session: session,
                user: user,
                isAttended: true,
                logbook: false,
              });
            } else {
              await this.sessionProgressRepository.save({
                session: session,
                user: user,
                isAttended: true,
                logbook: false,
              });
            }
          }
        } else if (lastWeek) {
          const lastWeekProgress = await this.weekProgressRepository.findOne(
            {
              where: {
                week: { id: lastWeek.id },
                user: { id: userId },
                process: true,
                quiz: true,
              },
            },
          );
          if (lastWeekProgress) {
            await this.userCourseRepository.update(userCourses.id, {
              progress: true,
            });
          }
        }
      }
    } else {
      const daftar = await this.registrationRepository.find({
        where: { course: { id: courseId }, process: 'process' },
      });

      const gabung = await this.userRepository.find({
        where: { userCourses: { course: { id: courseId } } },
      });
      const totalUsers = daftar.length + gabung.length;

      if (totalUsers >= course.quota) {
        throw new BadRequestException('The program is currently full');
      }

      const userCourses = await this.userCourseRepository.create({
        progress: false,
        user: user,
        course: course,
      });

      await this.userCourseRepository.save(userCourses);
      if (course.weeks.length > 0) {
        const weeks = await this.weeksRepository.findOne({
          where: { course: { id: courseId }, weekNumber: 1 },
          relations: ['session'],
        });
        const lastWeek = await this.weeksRepository.findOne({
          where: { course: { id: courseId }, isFinal: true },
        });
        if (weeks) {
          const existingProgresMinggu =
            await this.weekProgressRepository.findOne({
              where: { week: { id: weeks.id }, user: { id: userId } },
            });
          if (existingProgresMinggu) {
            await this.weekProgressRepository.save({
              id: existingProgresMinggu.id,
              weeks: weeks,
              user: user,
              proses: true,
              quiz: false,
            });
          } else {
            await this.weekProgressRepository.save({
              weeks: weeks,
              user: user,
              proses: true,
              quiz: false,
            });
          }

          const session = await this.sessionRepository.findOne({
            where: { weeks: { id: weeks.id }, sessionOrder: 1 },
            relations: [],
          });
          if (session) {
            const existingSessionProgress =
              await this.sessionProgressRepository.findOne({
                where: {
                  session: { id: session.id },
                  user: { id: userId },
                },
              });
            if (existingSessionProgress) {
              await this.sessionProgressRepository.save({
                id: existingSessionProgress.id,
                session: session,
                user: user,
                isAttended: true,
                logbook: false,
              });
            } else {
              await this.sessionProgressRepository.save({
                session: session,
                user: user,
                isAttended: true,
                logbook: false,
              });
            }
          }
        } else if (lastWeek) {
          const lastWeekProgress = await this.weekProgressRepository.findOne(
            {
              where: {
                week: { id: lastWeek.id },
                user: { id: userId },
                process: true,
                quiz: true,
              },
            },
          );
          if (lastWeekProgress) {
            await this.userCourseRepository.update(userCourses.id, {
              progress: true,
            });
          }
        }
      }
    }
  }

  async sumStudent(courseId: number) {
    const course = await this.findOne(courseId);
    if (course.checkPaid === true) {
      const daftar = await this.paymentRepository.find({
        where: { course: { id: courseId }, process: 'process' },
      });
      const gabung = await this.userCourseRepository.find({
        where: { course: { id: courseId } },
      });
      const totalUsers = daftar.length + gabung.length;
      return totalUsers;
    } else {
      const daftar = await this.registrationRepository.find({
        where: { course: { id: courseId }, process: 'process' },
      });
      const gabung = await this.userCourseRepository.find({
        where: { course: { id: courseId } },
      });
      const totalUsers = daftar.length + gabung.length;
      return totalUsers;
    }
  }

  async findMyCourse(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return await this.courseRepository.find({
      where: {
        userCourses: { user: { id: userId } },
      },
      relations: ['category', 'courseType'],
    });
  }

  async findMentoring() {
    return await this.userRepository.find({ where: { role: 'admin' } });
  }

  async findMentor(courseId) {
    return await this.mentorRepository.find({
      where: { course: { id: courseId } },
      relations: ['technologies'],
    });
  }

  async findCourseByMentoring(userId: number) {
    return await this.courseRepository.find({
      where: { mentorings: { user: { id: userId } } },
      relations: ['userCourses', 'category', 'courseType'],
    });
  }

  async findQuiz(weeksId: number, userId: number) {
    return await this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect(
        'quiz.quizProgresses',
        'quizProgresses',
        'quizProgresses.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('quiz.questions', 'questions')
      .leftJoinAndSelect('quiz.scores', 'scores', 'scores.userId = :userId', {
        userId,
      })
      .where('quiz.weeksId = :weeksId', { weeksId: weeksId })
      .orderBy('quiz.id', 'ASC')
      .getMany();
  }

  async findSession(weeksId: number, userId: number) {
    return await this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect(
        'session.sessionProgress',
        'sessionProgress',
        'sessionProgress.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'session.logbooks',
        'logbooks',
        'logbooks.userId = :userId',
      )
      .leftJoinAndSelect('session.attendances', 'attendances', 'attendances.userId = :userId', {
        userId,
      })
      .leftJoinAndSelect('session.assignments', 'assignments')
      .leftJoinAndSelect(
        'assignments.taskAnswers',
        'taskAnswers',
        'taskAnswers.userId = :userId',
        { userId },
      )
      .where('session.weeksId = :weeksId', { weeksId: weeksId })
      .orderBy('session.sessionOrder', 'ASC')
      .getMany();
  }

  async findWeeks(courseId: number, userId: number) {
    const course = await this.findOne(courseId);
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    return await this.weeksRepository
      .createQueryBuilder('weeks')
      .leftJoinAndSelect(
        'weeks.weekProgresses',
        'weekProgresses',
        'weekProgresses.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('weeks.course', 'course')
      .leftJoinAndSelect(
        'course.userCourses',
        'userCourses',
        'userCourses.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'course.portofolios',
        'portfolio',
        'portfolio.userId = :userId',
        { userId },
      )
      .where('weeks.courseId = :courseId', { courseId })
      .orderBy('weeks.week_number', 'ASC')
      .getMany();
  }

  async findLastWeek(courseId: number) {
    const weeks = await this.weeksRepository.find({
      where: { course: { id: courseId }, isFinal: true },
    });
    if (weeks.length) {
      return true;
    } else {
      return false;
    }
  }

  async findMentorLogbook(courseId: number) {
    return await this.mentorLogbookRepository.find({
      where: { session: { weeks: { course: { id: courseId } } } },
      relations: [
        'session',
        'session.weeks',
        'session.weeks.course',
        'session.weeks.course.mentorings',
        'session.weeks.course.courseType',
        'session.weeks.course.category',
      ],
      select: {
        id: true,
        activity: true,
        activityDetail: true,
        documentation: true,
        obstacle: true,
        createdAt: true,
        session: {
          sessionOrder: true,
          weeks: {
            weekNumber: true,
            course: {
              name: true,
              mentors: {
                name: true,
              },
              category: {
                name: true,
              },
              courseType: {
                nameClassesType: true,
              },
            },
          },
        },
      },
    });
  }

  async findLogBookUser(courseId: number) {
    return await this.logbookRepository.find({
      where: { session: { weeks: { course: { id: courseId } } } },
      relations: [
        'user',
        'session',
        'session.weeks',
        'session.weeks.course',
        'session.weeks.course.mentorings',
        'session.weeks.course.courseType',
        'session.weeks.course.category',
      ],
      select: {
        id: true,
        activity: true,
        activityDetails: true,
        documentation: true,
        process: true,
        obstacles: true,
        otherDocumentation: true,
        createdAt: true,
        user: {
          username: true,
          email: true,
        },
        session: {
          sessionOrder: true,
          weeks: {
            weekNumber: true,
            course: {
              name: true,
              mentors: {
                name: true,
              },
              category: {
                name: true,
              },
              courseType: {
                nameClassesType: true,
              },
            },
          },
        },
      },
    });
  }

  async findUser() {
    return await this.userRepository.find({ where: { role: 'user' } });
  }

  async findCategoryMyProgram(userId: number){
    return await this.categoryRepository.find({where: { courses: { userCourses: { user: { id: userId } } } } });
  }


  async findMyProgramCourseTypes(userId: number){
    return await this.courseTypeRepository.find({where: {classes: { userCourses: { user: { id: userId } } } } });
  }

  async findCategory() {
    return await this.categoryRepository.find();
  }
  async findCourseTypes() {
    return await this.courseTypeRepository.find();
  }

  async findAll() {
    return await this.courseRepository.find({ relations: ['category'] });
  }

  async findPaginatedCourses(params: {
  search?: string;
  alphabet?: string;
  page: number;
  limit: number;
  userId?: number; // kalau ada = admin, kalau tidak = super_admin
}) {
  const query = this.courseRepository.createQueryBuilder('course')
    .leftJoinAndSelect('course.category', 'category')
    .leftJoinAndSelect('course.userCourses', 'userCourses')
    .leftJoinAndSelect('course.mentorings', 'mentorings')
    .leftJoinAndSelect('mentorings.user', 'mentorUser')
    .orderBy('course.id', 'DESC');

  // Filter by mentor (admin only)
  if (params.userId) {
    query.innerJoin('course.mentorings', 'm')
      .andWhere('m.userId = :userId', { userId: params.userId });
  }

if (params.search) {
  query.andWhere(
    '(course.name ILIKE :search OR category.name ILIKE :search)',
    { search: `%${params.search}%` }
  );
}

  if (params.alphabet) {
    query.andWhere('course.name ILIKE :alphabet', {
      alphabet: `${params.alphabet}%`,
    });
  }

  query.skip((params.page - 1) * params.limit).take(params.limit);

  const [data, total] = await query.getManyAndCount();
  return { data, total };
}

  async findAllLaunch() {
    return await this.courseRepository.find({
      where: { launch: true },
      relations: ['category'],
    });
  }

  async findStudent(id: number) {
    return await this.userRepository.find({
      where: { userCourses: { course: { id: id } } },
    });
  }

  async findAllCourses() {
    return await this.courseRepository.find({
      relations: ['userCourses', 'category', 'mentorings', 'mentorings.user'],
    });
  }

async allClassExcept(courseId: number) {
  const course = await this.courseRepository.findOne({
    where: { id: courseId },
    relations: ['category', 'courseType'],
  });

  if (!course) {
    throw new NotFoundException('Program not found');
  }

  const usedIds = [courseId];
  let results: any[] = [];

  // 1. category & courseType sama (1 data)
  const sameAll = await this.courseRepository.find({
    where: {
      id: Not(In(usedIds)),
      launch: true,
      category: { id: course.category.id },
      courseType: { id: course.courseType.id },
    },
    relations: ['userCourses', 'category', 'courseType'],
    order: { id: 'DESC' },
    take: 1,
  });

  results.push(...sameAll);
  usedIds.push(...sameAll.map(k => k.id));

  // 2. category sama (1 data)
  const sameKategori = await this.courseRepository.find({
    where: {
      id: Not(In(usedIds)),
      launch: true,
      category: { id: course.category.id },
    },
    relations: ['userCourses', 'category', 'courseType'],
    order: { id: 'DESC' },
    take: 1,
  });

  results.push(...sameKategori);
  usedIds.push(...sameKategori.map(k => k.id));

  // 3. courseType sama (1 data)
  const sameJenis = await this.courseRepository.find({
    where: {
      id: Not(In(usedIds)),
      launch: true,
      courseType: { id: course.courseType.id },
    },
    relations: ['userCourses', 'category', 'courseType'],
    order: { id: 'DESC' },
    take: 1,
  });

  results.push(...sameJenis);
  usedIds.push(...sameJenis.map(k => k.id));

  // 🔥 fallback kalau kurang dari 3
  if (results.length < 3) {
    const remaining = 3 - results.length;

    const filler = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.userCourses', 'userCourses')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseType', 'courseType')
      .where('course.id NOT IN (:...ids)', { ids: usedIds })
      .andWhere('course.launch = true')
      .orderBy('RANDOM()')
      .limit(remaining)
      .getMany();

    results.push(...filler);
  }

  return results;
}

  async checkUserInCourse(courseId: number, userId: number) {
    return await this.userCourseRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });
  }

  async findTechnologies() {
    return await this.technologiesRepository.find();
  }

  async findCourseTechnologies(courseId: number) {
    return await this.technologiesRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findCourseQuestions(courseId: number) {
    return await this.courseQuestionRepository.find({
      where: { course: { id: courseId } },
      order: { id: 'ASC' },
    });
  }

  async findProgramBenefit(courseId: number) {
    return await this.programBenefitRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findCourseFlows(courseId: number) {
    return await this.courseFlowRepository.find({
      where: { course: { id: courseId } },
      order: { sequence: 'ASC' },
    });
  }

  async findOneCourse(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['category', 'courseType', 'technologies', 'userCourses'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async findOneUserCourse(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, launch: true },
      relations: ['category', 'courseType', 'userCourses', 'userCourses.user'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async getUserCourseRelation(userId: number, courseId: number) {
    return await this.userCourseRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });
  }

  async findOnePortfolio(userId: number, courseId: number) {
    return await this.portfolioRepository.findOne({
      where: { user: { id: userId },  course: { id: courseId } },
    });
  }

  async findOneUserLaunchCourse(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['category', 'courseType', 'userCourses', 'userCourses.user'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async findOneAdminCourse(courseId: number) {
    return await this.courseRepository.findOne({
      where: { id: courseId },
      relations: [
        'category',
        'courseType',
        'technologies',
        'mentorings',
        'mentorings.user',
        'userCourses',
      ],
    });
  }

  async findCourseWeeks(courseId: number) {
    return await this.weeksRepository.find({
      where: { course: { id: courseId } },
      order: { weekNumber: 'ASC' },
      relations: ['session'],
    });
  }

  async findCourseMentors(courseId: number) {
    return await this.mentorRepository.find({
      where: { course: { id: courseId } },
      relations: ['technologies'],
    });
  }

  async findCourseUsers(courseId: number) {
    return await this.userCourseRepository.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });
  }

  async findCoursePayments(courseId: number) {
    return await this.paymentRepository.find({
      where: { course: { id: courseId } },
      relations: ['user', 'course'],
    });
  }

  async findCourseRegistrations(courseId: number) {
    return await this.registrationRepository.find({
      where: { course: { id: courseId } },
      relations: ['user', 'course'],
    });
  }

  async findCoursePaymentInstallments(courseId: number) {
    return await this.paymentRepository.find({
      where: { course: { id: courseId }, installment: Not(IsNull()) },
      relations: ['user', 'course', 'installment'],
    });
  }

  async findCourseInstallments(courseId: number) {
    return await this.installmentsRepository.find({
      where: { course: { id: courseId } },
      order: { month: 'ASC' },
    });
  }

  async findCourseAlumni(courseId: number) {
    return await this.alumniRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findCourseMentoring(courseId: number) {
    return await this.userRepository.findOne({
      where: { mentoring: { course: { id: courseId } } },
    });
  }

  async findOne(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: [
        'category',
        'courseType',
        'technologies',
        'mentorings',
        'mentorings.user',
        'userCourses',
      ],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async updateLaunch(courseId: number, updateCourseDto: UpdateCoursesDto) {
    const course = await this.findOne(courseId);
    if (!course) {
      throw new NotFoundException();
    }
    if (course.launch === true) {
      updateCourseDto.launch = false;
    } else if (course.launch === false) {
      updateCourseDto.launch = true;
    }
    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async update(id: number, updateCourseDto: UpdateCoursesDto) {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException(`Program not found`);
    }

    if (updateCourseDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateCourseDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category not found`);
      }

      course.category = category;
    }

    if (updateCourseDto.courseTypeId) {
      const courseType = await this.courseTypeRepository.findOne({
        where: { id: updateCourseDto.courseTypeId },
      });

      if (!courseType) {
        throw new NotFoundException(`Program type not found`);
      }

      course.courseType = courseType;
    }

    if (updateCourseDto.technologiesIds !== undefined) {
      if (updateCourseDto.technologiesIds.length > 0) {
        course.technologies = await this.technologiesRepository.findBy({
          id: In(updateCourseDto.technologiesIds),
        });
      } else {
        course.technologies = [];
      }
    }

    const { courseTypeId, categoryId, technologiesIds, ...otherProperties } =
      updateCourseDto;
    Object.assign(course, otherProperties);

    return await this.courseRepository.save(course);
  }

  async remove(id: number) {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return await this.courseRepository.remove(course);
  }

  async removeCourseUser(userId: number, courseId: number) {
    const userCourses = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!userCourses) {
      throw new NotFoundException('User not found');
    }
    return await this.userCourseRepository.remove(userCourses);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {
    }
  }
}
