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
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
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
    private readonly kelasRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly kategoriRepository: Repository<Category>,
    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
    @InjectRepository(Weeks)
    private readonly mingguRepository: Repository<Weeks>,
    @InjectRepository(WeekProgress)
    private readonly progresMingguRepository: Repository<WeekProgress>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(SessionProgress)
    private readonly progresPertemuanRepository: Repository<SessionProgress>,
    @InjectRepository(Payment)
    private readonly pembayaranRepository: Repository<Payment>,
    @InjectRepository(UserCourse)
    private readonly userKelasRepository: Repository<UserCourse>,
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(Logbook)
    private readonly logbookRepository: Repository<Logbook>,
    @InjectRepository(LogbookMentor)
    private readonly logbookMentorRepository: Repository<LogbookMentor>,
    @InjectRepository(Technology)
    private readonly teknologiRepository: Repository<Technology>,
    @InjectRepository(Mentorings)
    private readonly mentoringRepository: Repository<Mentorings>,
    @InjectRepository(Registration)
    private readonly pendaftaranRepository: Repository<Registration>,
    @InjectRepository(CourseQuestions)
    private readonly pertanyaanKelasRepository: Repository<CourseQuestions>,
    @InjectRepository(ProgramBenefits)
    private readonly programBenefitRepository: Repository<ProgramBenefits>,
    @InjectRepository(CourseFlow)
    private readonly alurKelasRepository: Repository<CourseFlow>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(Installment)
    private readonly cicilanRepository: Repository<Installment>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,
  ) {}

  async findOneKategori(categoryId: number) {
    const category = await this.kategoriRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('category not Found');
    }
    return category;
  }

  async findNo(courseId: number) {
    const installment = await this.findCicilanKelas(courseId);
    const usedNumbers = installment.map((i) => Number(i.month));
      
    const availableNumbers = [3, 6, 12].filter(
      (n) => !usedNumbers.includes(n)
    );
    return availableNumbers;
  }

  async create(createKelassDto: CreateCoursesDto) {

    if (!createKelassDto.image || createKelassDto.image.trim() === '') {
    throw new BadRequestException('Image file is required');
  }

    const category = await this.kategoriRepository.findOne({
      where: { id: createKelassDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('category not Found');
    }
    const courseType = await this.courseTypeRepository.findOne({
      where: { id: createKelassDto.courseTypeId },
    });
    if (!courseType) {
      throw new NotFoundException('type program not Found');
    }

    let teknologi: Technology[] = [];
    if (
      createKelassDto.teknologiIds &&
      createKelassDto.teknologiIds.length > 0
    ) {
      teknologi = await this.teknologiRepository.findBy({
        id: In(createKelassDto.teknologiIds),
      });
    }

    const course = await this.kelasRepository.create({
      ...createKelassDto,
      category: category,
      courseType: courseType,
      teknologi: teknologi,
    });
    return await this.kelasRepository.save(course);
  }

  async createMentoring(userId: number, courseId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: 'admin' },
    });
    if (!user) {
      throw new NotFoundException('User not Found');
    }

    const course = await this.kelasRepository.findOne({
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
    const course = await this.kelasRepository.findOne({
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

  async addUserToKelas(userId: number, courseId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
      relations: ['weeks', 'weeks.session'],
    });
    if (!course) {
      throw new NotFoundException('Program Not Found');
    }

    const sudahGabung = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (sudahGabung) {
      throw new BadRequestException('User already joined the program');
    }

    if (course.check_paid === true) {
      const daftar = await this.pembayaranRepository.find({
        where: { course: { id: courseId }, process: 'proces' },
      });

      const gabung = await this.userRepository.find({
        where: { userCourses: { course: { id: courseId } } },
      });
      const jumlah_user = daftar.length + gabung.length;

      if (jumlah_user >= course.quota) {
        throw new BadRequestException('The program is currently full');
      }

      const userCourses = await this.userKelasRepository.create({
        progress: false,
        user: user,
        course: course,
      });

      await this.userKelasRepository.save(userCourses);

      if (course.weeks.length > 0) {
        const weeks = await this.mingguRepository.findOne({
          where: { course: { id: courseId }, weekNumber: 1 },
          relations: ['session'],
        });
        const minggu_akhir = await this.mingguRepository.findOne({
          where: { course: { id: courseId }, isFinal: true },
        });
        if (weeks) {
          const existingProgresMinggu =
            await this.progresMingguRepository.findOne({
              where: { week: { id: weeks.id }, user: { id: userId } },
            });
          if (existingProgresMinggu) {
            await this.progresMingguRepository.save({
              id: existingProgresMinggu.id,
              weeks: weeks,
              user: user,
              proses: true,
              quiz: false,
            });
          } else {
            await this.progresMingguRepository.save({
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
            const existingProgresPertemuan =
              await this.progresPertemuanRepository.findOne({
                where: {
                  session: { id: session.id },
                  user: { id: userId },
                },
              });
            if (existingProgresPertemuan) {
              await this.progresPertemuanRepository.save({
                id: existingProgresPertemuan.id,
                session: session,
                user: user,
                attendances: true,
                logbook: false,
              });
            } else {
              await this.progresPertemuanRepository.save({
                session: session,
                user: user,
                attendances: true,
                logbook: false,
              });
            }
          }
        } else if (minggu_akhir) {
          const progresMingguAkhir = await this.progresMingguRepository.findOne(
            {
              where: {
                week: { id: minggu_akhir.id },
                user: { id: userId },
                process: true,
                quiz: true,
              },
            },
          );
          if (progresMingguAkhir) {
            await this.userKelasRepository.update(userCourses.id, {
              progress: true,
            });
          }
        }
      }
    } else {
      const daftar = await this.pendaftaranRepository.find({
        where: { course: { id: courseId }, process: 'proces' },
      });

      const gabung = await this.userRepository.find({
        where: { userCourses: { course: { id: courseId } } },
      });
      const jumlah_user = daftar.length + gabung.length;

      if (jumlah_user >= course.quota) {
        throw new BadRequestException('The program is currently full');
      }

      const userCourses = await this.userKelasRepository.create({
        progress: false,
        user: user,
        course: course,
      });

      await this.userKelasRepository.save(userCourses);
      if (course.weeks.length > 0) {
        const weeks = await this.mingguRepository.findOne({
          where: { course: { id: courseId }, weekNumber: 1 },
          relations: ['session'],
        });
        const minggu_akhir = await this.mingguRepository.findOne({
          where: { course: { id: courseId }, isFinal: true },
        });
        if (weeks) {
          const existingProgresMinggu =
            await this.progresMingguRepository.findOne({
              where: { week: { id: weeks.id }, user: { id: userId } },
            });
          if (existingProgresMinggu) {
            await this.progresMingguRepository.save({
              id: existingProgresMinggu.id,
              weeks: weeks,
              user: user,
              proses: true,
              quiz: false,
            });
          } else {
            await this.progresMingguRepository.save({
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
            const existingProgresPertemuan =
              await this.progresPertemuanRepository.findOne({
                where: {
                  session: { id: session.id },
                  user: { id: userId },
                },
              });
            if (existingProgresPertemuan) {
              await this.progresPertemuanRepository.save({
                id: existingProgresPertemuan.id,
                session: session,
                user: user,
                attendances: true,
                logbook: false,
              });
            } else {
              await this.progresPertemuanRepository.save({
                session: session,
                user: user,
                attendances: true,
                logbook: false,
              });
            }
          }
        } else if (minggu_akhir) {
          const progresMingguAkhir = await this.progresMingguRepository.findOne(
            {
              where: {
                week: { id: minggu_akhir.id },
                user: { id: userId },
                process: true,
                quiz: true,
              },
            },
          );
          if (progresMingguAkhir) {
            await this.userKelasRepository.update(userCourses.id, {
              progress: true,
            });
          }
        }
      }
    }
  }

  async sumStudent(courseId: number) {
    const course = await this.findOne(courseId);
    if (course.check_paid === true) {
      const daftar = await this.pembayaranRepository.find({
        where: { course: { id: courseId }, process: 'proces' },
      });
      const gabung = await this.userKelasRepository.find({
        where: { course: { id: courseId } },
      });
      const jumlah_user = daftar.length + gabung.length;
      return jumlah_user;
    } else {
      const daftar = await this.pendaftaranRepository.find({
        where: { course: { id: courseId }, process: 'proces' },
      });
      const gabung = await this.userKelasRepository.find({
        where: { course: { id: courseId } },
      });
      const jumlah_user = daftar.length + gabung.length;
      return jumlah_user;
    }
  }

  async findMyCourse(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return await this.kelasRepository.find({
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
      relations: ['teknologi'],
    });
  }

  async findKelasByMentoring(userId: number) {
    return await this.kelasRepository.find({
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

  async findPertemuan(weeksId: number, userId: number) {
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
      .orderBy('session.pertemuan_ke', 'ASC')
      .getMany();
  }

  async findMinggu(courseId: number, userId: number) {
    const course = await this.findOne(courseId);
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    return await this.mingguRepository
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
        'course.portfolio',
        'portfolio',
        'portfolio.userId = :userId',
        { userId },
      )
      .where('weeks.courseId = :courseId', { courseId })
      .orderBy('weeks.minggu_ke', 'ASC')
      .getMany();
  }

  async findMingguTerakhir(courseId: number) {
    const weeks = await this.mingguRepository.find({
      where: { course: { id: courseId }, isFinal: true },
    });
    if (weeks.length) {
      return true;
    } else {
      return false;
    }
  }

  async findLogbookMentor(courseId: number) {
    return await this.logbookMentorRepository.find({
      where: { session: { weeks: { course: { id: courseId } } } },
      relations: [
        'session',
        'session.weeks',
        'session.weeks.course',
        'session.weeks.course.mentor',
        'session.weeks.course.courseType',
        'session.weeks.course.category',
      ],
      select: {
        id: true,
        activity: true,
        activity_detail: true,
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
                name_clasess_type: true,
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
        'session.weeks.course.mentor',
        'session.weeks.course.courseType',
        'session.weeks.course.category',
      ],
      select: {
        id: true,
        activity: true,
        activityDetails: true,
        dokumentasi: true,
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
                name_clasess_type: true,
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

  async findKategoriMyProgram(userId: number){
    return await this.kategoriRepository.find({where: { courses: { userCourses: { user: { id: userId } } } } });
  }


  async findJenisKelasMyProgram(userId: number){
    return await this.courseTypeRepository.find({where: {classes: { userCourses: { user: { id: userId } } } } });
  }

  async findKategori() {
    return await this.kategoriRepository.find();
  }
  async findJenisKelas() {
    return await this.courseTypeRepository.find();
  }

  async findAll() {
    return await this.kelasRepository.find({ relations: ['category'] });
  }

  async findKelasPaginated(params: {
  search?: string;
  alphabet?: string;
  page: number;
  limit: number;
  userId?: number; // kalau ada = admin, kalau tidak = super_admin
}) {
  const query = this.kelasRepository.createQueryBuilder('course')
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
    '(course.nama_kelas ILIKE :search OR category.nama_kategori ILIKE :search)',
    { search: `%${params.search}%` }
  );
}

  if (params.alphabet) {
    query.andWhere('course.nama_kelas ILIKE :alphabet', {
      alphabet: `${params.alphabet}%`,
    });
  }

  query.skip((params.page - 1) * params.limit).take(params.limit);

  const [data, total] = await query.getManyAndCount();
  return { data, total };
}

  async findAllLaunch() {
    return await this.kelasRepository.find({
      where: { launch: true },
      relations: ['category'],
    });
  }

  async findMurid(id: number) {
    return await this.userRepository.find({
      where: { userCourses: { course: { id: id } } },
    });
  }

  async allKelas() {
    return await this.kelasRepository.find({
      relations: ['userCourses', 'category', 'mentorings', 'mentorings.user'],
    });
  }

async allClassExcept(courseId: number) {
  const course = await this.kelasRepository.findOne({
    where: { id: courseId },
    relations: ['category', 'courseType'],
  });

  if (!course) {
    throw new NotFoundException('Program not found');
  }

  const usedIds = [courseId];
  let results: any[] = [];

  // 1. category & courseType sama (1 data)
  const sameAll = await this.kelasRepository.find({
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
  const sameKategori = await this.kelasRepository.find({
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
  const sameJenis = await this.kelasRepository.find({
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

    const filler = await this.kelasRepository
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

  async checkUserInKelas(courseId: number, userId: number) {
    return await this.userKelasRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });
  }

  async findTeknologi() {
    return await this.teknologiRepository.find();
  }

  async findTeknologiKelas(courseId: number) {
    return await this.teknologiRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findPertanyaanKelas(courseId: number) {
    return await this.pertanyaanKelasRepository.find({
      where: { course: { id: courseId } },
      order: { id: 'ASC' },
    });
  }

  async findProgramBenefit(courseId: number) {
    return await this.programBenefitRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findAlurKelas(courseId: number) {
    return await this.alurKelasRepository.find({
      where: { course: { id: courseId } },
      order: { sequence: 'ASC' },
    });
  }

  async findOneKelas(courseId: number) {
    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
      relations: ['category', 'courseType', 'teknologi', 'userCourses'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async findOneKelasUser(courseId: number) {
    const course = await this.kelasRepository.findOne({
      where: { id: courseId, launch: true },
      relations: ['category', 'courseType', 'userCourses', 'userCourses.user'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async findOneUserKelas(userId: number, courseId: number) {
    return await this.userKelasRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });
  }

  async findOnePortfolio(userId: number, courseId: number) {
    return await this.portfolioRepository.findOne({
      where: { user: { id: userId },  course: { id: courseId } },
    });
  }

  async findOneKelasUserLaunch(courseId: number) {
    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
      relations: ['category', 'courseType', 'userCourses', 'userCourses.user'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async findOneKelasAdmin(courseId: number) {
    return await this.kelasRepository.findOne({
      where: { id: courseId },
      relations: [
        'category',
        'courseType',
        'teknologi',
        'mentorings',
        'mentorings.user',
        'userCourses',
      ],
    });
  }

  async findMingguKelas(courseId: number) {
    return await this.mingguRepository.find({
      where: { course: { id: courseId } },
      order: { weekNumber: 'ASC' },
      relations: ['session'],
    });
  }

  async findMentorKelas(courseId: number) {
    return await this.mentorRepository.find({
      where: { course: { id: courseId } },
      relations: ['teknologi'],
    });
  }

  async findUserKelas(courseId: number) {
    return await this.userKelasRepository.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });
  }

  async findPembayaranKelas(courseId: number) {
    return await this.pembayaranRepository.find({
      where: { course: { id: courseId } },
      relations: ['user', 'course'],
    });
  }

  async findPendaftaranKelas(courseId: number) {
    return await this.pendaftaranRepository.find({
      where: { course: { id: courseId } },
      relations: ['user', 'course'],
    });
  }

  async findPaymentInstallmentKelas(courseId: number) {
    return await this.pembayaranRepository.find({
      where: { course: { id: courseId }, installment: Not(IsNull()) },
      relations: ['user', 'course'],
    });
  }

  async findCicilanKelas(courseId: number) {
    return await this.cicilanRepository.find({
      where: { course: { id: courseId } },
      order: { month: 'ASC' },
    });
  }

  async findAlumniKelas(courseId: number) {
    return await this.alumniRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findMentoringKelas(courseId: number) {
    return await this.userRepository.findOne({
      where: { mentoring: { course: { id: courseId } } },
    });
  }

  async findOne(courseId: number) {
    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
      relations: [
        'category',
        'courseType',
        'teknologi',
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

  async updateLaunch(courseId: number, updateKelassDto: UpdateCoursesDto) {
    const course = await this.findOne(courseId);
    if (!course) {
      throw new NotFoundException();
    }
    if (course.launch === true) {
      updateKelassDto.launch = false;
    } else if (course.launch === false) {
      updateKelassDto.launch = true;
    }
    Object.assign(course, updateKelassDto);
    return await this.kelasRepository.save(course);
  }

  async update(id: number, updateKelassDto: UpdateCoursesDto) {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException(`Program not found`);
    }

    if (updateKelassDto.categoryId) {
      const category = await this.kategoriRepository.findOne({
        where: { id: updateKelassDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category not found`);
      }

      course.category = category;
    }

    if (updateKelassDto.courseTypeId) {
      const courseType = await this.courseTypeRepository.findOne({
        where: { id: updateKelassDto.courseTypeId },
      });

      if (!courseType) {
        throw new NotFoundException(`Program type not found`);
      }

      course.courseType = courseType;
    }

    if (updateKelassDto.teknologiIds !== undefined) {
      if (updateKelassDto.teknologiIds.length > 0) {
        course.teknologi = await this.teknologiRepository.findBy({
          id: In(updateKelassDto.teknologiIds),
        });
      } else {
        course.teknologi = [];
      }
    }

    const { courseTypeId, categoryId, teknologiIds, ...otherProperties } =
      updateKelassDto;
    Object.assign(course, otherProperties);

    return await this.kelasRepository.save(course);
  }

  async remove(id: number) {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return await this.kelasRepository.remove(course);
  }

  async removeUserKelas(userId: number, courseId: number) {
    const userCourses = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!userCourses) {
      throw new NotFoundException('User not found');
    }
    return await this.userKelasRepository.remove(userCourses);
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
