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
import { capabilitiesFor } from './program-type';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Payment } from 'src/entities/payment.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Mentors } from 'src/entities/mentor.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { QuizProgress } from 'src/entities/quiz_progress.entity';
import { Score } from 'src/entities/score.entity';
import { Technology } from 'src/entities/technology.entity';
import { Mentorings } from 'src/entities/mentoring.entity';
import { Registration } from 'src/entities/registration.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { CourseQuestions } from 'src/entities/course_question.entity';
import { ProgramBenefits } from 'src/entities/course_benefit.entity';
import { Participants } from 'src/entities/participants.entity';
import { CourseFlow } from 'src/entities/course_flow.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Installment } from 'src/entities/installment.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Portofolios } from 'src/entities/portofolios.entity';
import { dateHelpers } from 'src/common/helpers/date.helpers';

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
    @InjectRepository(Participants)
    private readonly participantsRepository: Repository<Participants>,
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

  async findOneCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('category not Found');
    }
    return category;
  }

  async findNo(courseId: string) {
    const installment = await this.findCourseInstallments(courseId);
    const usedNumbers = installment.map((i) => Number(i.month));

    const availableNumbers = [3].filter((n) => !usedNumbers.includes(n));
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

    const { endDate, ...restDto } = createCourseDto;
    const course = await this.courseRepository.create({
      ...restDto,
      startDate: new Date(createCourseDto.startDate),
      startEnd: new Date(endDate),
      date_registration: createCourseDto.date_registration
        ? new Date(createCourseDto.date_registration)
        : undefined,
      category: category,
      courseType: courseType,
      technologies: technologies,
    });
    const saved = await this.courseRepository.save(course);
    await this.ensureSyllabusContainer(saved);
    return saved;
  }

  /**
   * Program non-bootcamp memakai silabus datar, dan silabus ITU ADALAH Session
   * (lihat docs/program-type-plan.md bagian 3.3, opsi A). Session tetap butuh
   * induk `Weeks`, jadi program seperti ini diberi TEPAT SATU baris weeks yang
   * tidak pernah ditampilkan - wadah urutan, bukan minggu.
   *
   * Tanpa ini admin tidak punya tempat untuk menaruh silabus sama sekali:
   * layar admin menambahkan sesi ke sebuah minggu, dan program non-bootcamp
   * tidak pernah membuat minggu.
   *
   * Idempoten: dipanggil ulang tidak membuat wadah kedua.
   */
  async ensureSyllabusContainer(course: Course): Promise<Weeks | null> {
    if (capabilitiesFor(course.programType).structure !== 'syllabus') {
      return null;
    }
    const existing = await this.weeksRepository.findOne({
      where: { course: { id: course.id } },
      order: { weekNumber: 'ASC' },
    });
    if (existing) return existing;

    const container = this.weeksRepository.create({
      weekNumber: 1,
      description: course.name,
      isFinal: true,
      course: course,
    });
    return await this.weeksRepository.save(container);
  }

  async createMentoring(userId: string, courseId: string) {
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

  async updateMentoring(userId: string, courseId: string) {
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

  async addUserToCourse(userId: string, courseId: string) {
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
          const lastWeekProgress = await this.weekProgressRepository.findOne({
            where: {
              week: { id: lastWeek.id },
              user: { id: userId },
              process: true,
              quiz: true,
            },
          });
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
          const lastWeekProgress = await this.weekProgressRepository.findOne({
            where: {
              week: { id: lastWeek.id },
              user: { id: userId },
              process: true,
              quiz: true,
            },
          });
          if (lastWeekProgress) {
            await this.userCourseRepository.update(userCourses.id, {
              progress: true,
            });
          }
        }
      }
    }
  }

  async sumStudent(courseId: string) {
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

  async findMyCourse(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return await this.courseRepository
      .createQueryBuilder('course')
      .innerJoin(
        'course.userCourses',
        'userCourses',
        'userCourses.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseType', 'courseType')
      .leftJoinAndSelect('course.weeks', 'weeks')
      .leftJoinAndSelect(
        'weeks.weekProgresses',
        'weekProgresses',
        'weekProgresses.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('weeks.quiz', 'quiz')
      .orderBy('weeks.week_number', 'ASC')
      .getMany();
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

  async findCourseByMentoring(userId: string) {
    return await this.courseRepository.find({
      where: { mentorings: { user: { id: userId } } },
      relations: ['userCourses', 'category', 'courseType'],
    });
  }

  async findQuiz(weeksId: string, userId: string) {
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
      .orderBy('quiz.createdAt', 'ASC')
      .getMany();
  }

  async findSession(weeksId: string, userId: string) {
    return await this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.materials', 'materials')
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
      .leftJoinAndSelect(
        'session.attendances',
        'attendances',
        'attendances.userId = :userId',
        {
          userId,
        },
      )
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

  /**
   * Data untuk halaman detail sesi milik student.
   *
   * Mengembalikan sesi beserta seluruh isinya, saudara-saudaranya dalam minggu
   * yang sama (untuk navigasi dan perhitungan kunci), dan status buka-kunci.
   *
   * Status kunci DIHITUNG DI SINI, tidak lagi hanya di sisi klien. Sebelum ada
   * halaman ini, penguncian sesi hanya ada di `sessionUnlock.ts` yang berjalan
   * di browser; begitu sesi punya URL sendiri, aturan yang sama harus berlaku
   * di server, kalau tidak student bisa melompati kunci dengan menempel URL.
   * Aturannya disalin persis dari canOpenNextSession():
   *   sesi sebelumnya harus hadir DAN logbooknya disetujui.
   */
  async findSessionDetail(sessionId: string, userId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });
    if (!session?.weeks?.course) {
      throw new NotFoundException('Session not found');
    }
    const courseId = session.weeks.course.id;

    // Student hanya boleh melihat sesi dari program yang benar-benar diikutinya.
    const enrolment = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!enrolment) {
      throw new NotFoundException('Session not found');
    }

    // Sesi satu minggu, lengkap dengan data milik user ini. Dipakai dua kali:
    // mencari sesi yang diminta, dan menghitung kuncinya dari sesi sebelumnya.
    const siblings = await this.findSession(session.weeks.id, userId);
    const index = siblings.findIndex((x) => x.id === sessionId);
    const current = index >= 0 ? siblings[index] : null;
    if (!current) {
      throw new NotFoundException('Session not found');
    }

    // PENTING soal penamaan: `session_progresses.isAttended` bukan berarti
    // student sudah mengisi absensi, melainkan sesinya sudah TERBUKA. Baris itu
    // ditulis saat pendaftaran (sesi pertama) dan saat logbook sesi sebelumnya
    // disetujui (logbook.service.ts). Kehadiran sungguhan ada di tabel
    // `attendance`. Panel Start Learning memakai arti yang sama, jadi aturan di
    // sini sengaja disamakan dengannya - kalau tidak, panel menampilkan sesi
    // sebagai terbuka sementara halamannya menolak membukanya.
    const unlocked = current.sessionProgress?.[0]?.isAttended === true;
    const attended = (current.attendances?.length ?? 0) > 0;
    const logbookDone =
      current.sessionProgress?.[0]?.logbook === true ||
      current.logbooks?.[0]?.process === 'approved';
    const previous = index > 0 ? siblings[index - 1] : null;

    return {
      session: current,
      week: session.weeks,
      course: session.weeks.course,
      previous,
      next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
      position: index + 1,
      totalSessions: siblings.length,
      unlocked,
      attended,
      logbookDone,
    };
  }

  /**
   * Hitungan ringkas untuk kepala tiap tab program.
   *
   * Idenya diambil dari blok ringkasan pada halaman belajar bisa.ai: sebelum
   * daftar panjangnya, student melihat dulu berapa yang sudah beres dan berapa
   * yang belum. Sebelum ini tiap tab langsung menyodorkan daftar minggu tanpa
   * memberi gambaran keseluruhan.
   *
   * Semuanya COUNT, bukan pengambilan baris: yang ditampilkan memang hanya
   * angkanya, dan daftar isinya tetap diambil per minggu seperti sebelumnya.
   */
  async findLearningStats(courseId: string, userId: string) {
    const em = this.sessionRepository.manager;

    // CATATAN PENTING soal query builder TypeORM:
    // `.where()` MENGGANTI seluruh kondisi yang sudah dirangkai sebelumnya,
    // bukan menambah. Versi pertama fungsi ini memanggil `.where(course)` di
    // akhir rantai, sehingga semua `.andWhere(user/status)` terhapus dan tiap
    // hitungan "disetujui" maupun "ditolak" mengembalikan angka yang sama:
    // jumlah seluruh baris pada program itu. Terlihat langsung begitu
    // ringkasannya ditampilkan - 6 disetujui DAN 6 ditolak dari total 6.
    // Karena itu kondisi program dipasang sebagai `.where()` PERTAMA.
    const forCourse = (qb: any, alias: string) =>
      qb.where(`${alias}.courseId = :courseId`, { courseId });

    // Hitungan "sudah beres" memakai DISTINCT pada induknya: satu sesi bisa
    // punya lebih dari satu baris absensi, dan satu tugas lebih dari satu
    // jawaban. Tanpa DISTINCT, angkanya bisa melebihi totalnya - kuis sempat
    // tampil "2 dari 1 lulus".
    const countDistinct = async (qb: any, expr: string) => {
      const row = await qb.select(`COUNT(DISTINCT ${expr})`, 'c').getRawOne();
      return Number(row?.c ?? 0);
    };

    const [
      sessionsTotal,
      sessionsAttended,
      assignmentsTotal,
      assignmentsSubmitted,
      assignmentsApproved,
      quizzesTotal,
      quizzesPassed,
      logbooksTotal,
      logbooksApproved,
      logbooksRejected,
    ] = await Promise.all([
      forCourse(
        em.createQueryBuilder(Session, 's').innerJoin('s.weeks', 'w'),
        'w',
      ).getCount(),
      countDistinct(
        forCourse(
          em
            .createQueryBuilder(Attendance, 'a')
            .innerJoin('a.session', 's')
            .innerJoin('s.weeks', 'w'),
          'w',
        ).andWhere('a.userId = :userId', { userId }),
        's.id',
      ),
      forCourse(
        em
          .createQueryBuilder(Assignment, 'asg')
          .innerJoin('asg.session', 's')
          .innerJoin('s.weeks', 'w'),
        'w',
      ).getCount(),
      countDistinct(
        forCourse(
          em
            .createQueryBuilder(AnswerTask, 'at')
            .innerJoin('at.task', 'asg')
            .innerJoin('asg.session', 's')
            .innerJoin('s.weeks', 'w'),
          'w',
        ).andWhere('at.userId = :userId', { userId }),
        'asg.id',
      ),
      countDistinct(
        forCourse(
          em
            .createQueryBuilder(AnswerTask, 'at')
            .innerJoin('at.task', 'asg')
            .innerJoin('asg.session', 's')
            .innerJoin('s.weeks', 'w'),
          'w',
        )
          .andWhere('at.userId = :userId', { userId })
          .andWhere("at.process = 'approved'"),
        'asg.id',
      ),
      forCourse(
        em.createQueryBuilder(Quiz, 'q').innerJoin('q.weeks', 'w'),
        'w',
      ).getCount(),
      // LULUS, bukan TERBUKA. Hitungan ini dulu memakai QuizProgress dengan
      // `process = true`, padahal baris itu dibuat saat logbook sesi terakhir
      // sebuah minggu disetujui (logbook.service.ts:228) - artinya kuisnya baru
      // TERBUKA. Akibatnya ringkasan menulis '1 dari 1 kuis lulus' untuk kuis
      // yang belum pernah dikerjakan sama sekali. Lulus = ada nilai yang
      // mencapai minimum_score kuisnya.
      countDistinct(
        forCourse(
          em
            .createQueryBuilder(Score, 'sc')
            .innerJoin('sc.quiz', 'q')
            .innerJoin('q.weeks', 'w'),
          'w',
        )
          .andWhere('sc.userId = :userId', { userId })
          .andWhere('sc.score >= q.minimum_score'),
        'q.id',
      ),
      forCourse(
        em
          .createQueryBuilder(Logbook, 'l')
          .innerJoin('l.session', 's')
          .innerJoin('s.weeks', 'w'),
        'w',
      )
        .andWhere('l.userId = :userId', { userId })
        .getCount(),
      forCourse(
        em
          .createQueryBuilder(Logbook, 'l')
          .innerJoin('l.session', 's')
          .innerJoin('s.weeks', 'w'),
        'w',
      )
        .andWhere('l.userId = :userId', { userId })
        .andWhere("l.process = 'approved'")
        .getCount(),
      forCourse(
        em
          .createQueryBuilder(Logbook, 'l')
          .innerJoin('l.session', 's')
          .innerJoin('s.weeks', 'w'),
        'w',
      )
        .andWhere('l.userId = :userId', { userId })
        .andWhere("l.process = 'rejected'")
        .getCount(),
    ]);

    const pct = (done: number, total: number) =>
      total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      sessions: {
        total: sessionsTotal,
        attended: sessionsAttended,
        percent: pct(sessionsAttended, sessionsTotal),
      },
      assignments: {
        total: assignmentsTotal,
        submitted: assignmentsSubmitted,
        approved: assignmentsApproved,
        pending: Math.max(0, assignmentsTotal - assignmentsSubmitted),
        percent: pct(assignmentsApproved, assignmentsTotal),
      },
      quizzes: {
        total: quizzesTotal,
        passed: quizzesPassed,
        percent: pct(quizzesPassed, quizzesTotal),
      },
      logbooks: {
        total: logbooksTotal,
        approved: logbooksApproved,
        rejected: logbooksRejected,
        inReview: Math.max(0, logbooksTotal - logbooksApproved - logbooksRejected),
        percent: pct(logbooksApproved, logbooksTotal),
      },
    };
  }

  /**
   * Hitungan per minggu untuk kepala akordeon di tab Attendance, Assignment,
   * dan Quiz.
   *
   * Kepala minggu sebelumnya hanya menulis "Week 1" beserta deskripsi yang
   * sering cuma mengulang nomornya, jadi satu-satunya cara tahu ada apa di
   * dalam sebuah minggu adalah membukanya satu per satu. Hitungan ini dirender
   * langsung di kepala supaya minggu bisa dilewati tanpa dibuka.
   *
   * Dua catatan yang sama dengan findLearningStats berlaku di sini:
   * `.where()` MENGGANTI seluruh kondisi sebelumnya - karena itu kondisi
   * program selalu jadi `.where()` PERTAMA - dan hitungan "sudah beres"
   * memakai COUNT(DISTINCT induk), sebab satu sesi bisa punya lebih dari satu
   * baris absensi dan satu tugas lebih dari satu jawaban.
   */
  async findWeekSummaries(courseId?: string, userId?: string) {
    const summaries: Record<
      string,
      {
        sessions: number;
        attended: number;
        assignments: number;
        submitted: number;
        quizzes: number;
        quizzesUnlocked: number;
        quizzesPassed: number;
      }
    > = {};
    if (!courseId || !userId) return summaries;

    const em = this.sessionRepository.manager;
    const forCourse = (qb: any) =>
      qb.where('w.courseId = :courseId', { courseId });

    // Satu baris per minggu: { weekId, c }. Minggu tanpa baris sama sekali
    // tidak muncul di hasil, jadi pembacanya harus tahan nilai kosong -
    // itulah gunanya `blank()`.
    const perWeek = async (qb: any, expr: string) =>
      (await qb
        .select('w.id', 'weekId')
        .addSelect(`COUNT(DISTINCT ${expr})`, 'c')
        .groupBy('w.id')
        .getRawMany()) as Array<{ weekId: string; c: string }>;

    const [
      sessions,
      attended,
      assignments,
      submitted,
      quizzes,
      quizzesUnlocked,
      quizzesPassed,
    ] = await Promise.all([
      perWeek(
        forCourse(em.createQueryBuilder(Session, 's').innerJoin('s.weeks', 'w')),
        's.id',
      ),
      perWeek(
        forCourse(
          em
            .createQueryBuilder(Attendance, 'a')
            .innerJoin('a.session', 's')
            .innerJoin('s.weeks', 'w'),
        ).andWhere('a.userId = :userId', { userId }),
        's.id',
      ),
      perWeek(
        forCourse(
          em
            .createQueryBuilder(Assignment, 'asg')
            .innerJoin('asg.session', 's')
            .innerJoin('s.weeks', 'w'),
        ),
        'asg.id',
      ),
      perWeek(
        forCourse(
          em
            .createQueryBuilder(AnswerTask, 'at')
            .innerJoin('at.task', 'asg')
            .innerJoin('asg.session', 's')
            .innerJoin('s.weeks', 'w'),
        ).andWhere('at.userId = :userId', { userId }),
        'asg.id',
      ),
      perWeek(
        forCourse(em.createQueryBuilder(Quiz, 'q').innerJoin('q.weeks', 'w')),
        'q.id',
      ),
      // TERBUKA: baris QuizProgress dibuat saat logbook sesi terakhir minggu
      // itu disetujui. Bukan tanda lulus.
      perWeek(
        forCourse(
          em
            .createQueryBuilder(QuizProgress, 'qp')
            .innerJoin('qp.quiz', 'q')
            .innerJoin('q.weeks', 'w'),
        )
          .andWhere('qp.userId = :userId', { userId })
          .andWhere('qp.process = true'),
        'q.id',
      ),
      // LULUS: ada nilai yang mencapai minimum_score kuisnya.
      perWeek(
        forCourse(
          em
            .createQueryBuilder(Score, 'sc')
            .innerJoin('sc.quiz', 'q')
            .innerJoin('q.weeks', 'w'),
        )
          .andWhere('sc.userId = :userId', { userId })
          .andWhere('sc.score >= q.minimum_score'),
        'q.id',
      ),
    ]);

    const blank = () => ({
      sessions: 0,
      attended: 0,
      assignments: 0,
      submitted: 0,
      quizzes: 0,
      quizzesUnlocked: 0,
      quizzesPassed: 0,
    });
    const merge = (
      list: Array<{ weekId: string; c: string }>,
      key: keyof ReturnType<typeof blank>,
    ) => {
      for (const row of list) {
        summaries[row.weekId] ??= blank();
        summaries[row.weekId][key] = Number(row.c ?? 0);
      }
    };

    merge(sessions, 'sessions');
    merge(attended, 'attended');
    merge(assignments, 'assignments');
    merge(submitted, 'submitted');
    merge(quizzes, 'quizzes');
    merge(quizzesUnlocked, 'quizzesUnlocked');
    merge(quizzesPassed, 'quizzesPassed');

    return summaries;
  }

  async findWeeks(courseId: string, userId: string) {
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

  // async findWeeksWithUnlock(courseId: string, userId: string) {
  //   const weeks = await this.weeksRepository
  //     .createQueryBuilder('weeks')
  //     .leftJoinAndSelect('weeks.session', 'session')
  //     .leftJoinAndSelect('session.materials', 'materials')
  //     .leftJoinAndSelect(
  //       'session.sessionProgress',
  //       'sessionProgress',
  //       'sessionProgress.userId = :userId',
  //       { userId },
  //     )
  //     .where('weeks.courseId = :courseId', { courseId })
  //     .orderBy('weeks.week_number', 'ASC')
  //     .getMany();

  //   return weeks.map((week, index) => {
  //     let isUnlocked = index === 0;
  //     if (index > 0) {
  //       const prevWeek = weeks[index - 1];
  //       isUnlocked = prevWeek.session.some((session) =>
  //         session.sessionProgress.some((sp) => sp.isAttended),
  //       );
  //     }
  //     return { ...week, isUnlocked };
  //   });
  // }

  async findLastWeek(courseId: string) {
    const weeks = await this.weeksRepository.find({
      where: { course: { id: courseId }, isFinal: true },
    });
    if (weeks.length) {
      return true;
    } else {
      return false;
    }
  }

  async findMentorLogbook(courseId: string) {
    return await this.mentorLogbookRepository.find({
      where: { session: { weeks: { course: { id: courseId } } } },
      relations: [
        'session',
        'session.weeks',
        'session.weeks.course',
        'session.weeks.course.mentors',
        'session.weeks.course.courseType',
        'session.weeks.course.category',
        'user',
      ],
      select: {
        id: true,
        activity: true,
        activityDetail: true,
        documentation: true,
        obstacle: true,
        createdAt: true,
        user: {
          username: true,
          email: true,
          profile: true,
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

  async findLogBookUser(courseId: string) {
    return await this.logbookRepository.find({
      where: { session: { weeks: { course: { id: courseId } } } },
      relations: [
        'user',
        'session',
        'session.weeks',
        'session.weeks.course',
        'session.weeks.course.mentors',
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
          profile: true,
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

  async findCategoryMyProgram(userId: string) {
    return await this.categoryRepository.find({
      where: { courses: { userCourses: { user: { id: userId } } } },
    });
  }

  async findMyProgramCourseTypes(userId: string) {
    return await this.courseTypeRepository.find({
      where: { classes: { userCourses: { user: { id: userId } } } },
    });
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
    userId?: string; // kalau ada = admin, kalau tidak = super_admin
  }) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.userCourses', 'userCourses')
      .leftJoinAndSelect('course.mentorings', 'mentorings')
      .leftJoinAndSelect('mentorings.user', 'mentorUser')
      .orderBy('course.createdAt', 'DESC');

    // Filter by mentor (admin only)
    if (params.userId) {
      query
        .innerJoin('course.mentorings', 'm')
        .andWhere('m.userId = :userId', { userId: params.userId });
    }

    if (params.search) {
      query.andWhere(
        '(course.name ILIKE :search OR category.name ILIKE :search)',
        { search: `%${params.search}%` },
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

  async findStudent(id: string) {
    return await this.userRepository.find({
      where: { userCourses: { course: { id: id } } },
    });
  }

  async findAllCourses() {
    return await this.courseRepository.find({
      relations: ['userCourses', 'category', 'mentorings', 'mentorings.user'],
    });
  }

  async allClassExcept(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['category', 'courseType'],
    });

    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const usedIds = [courseId];
    const results: any[] = [];

    // 1. category & courseType sama (1 data)
    const sameAll = await this.courseRepository.find({
      where: {
        id: Not(In(usedIds)),
        launch: true,
        category: { id: course.category.id },
        courseType: { id: course.courseType.id },
      },
      relations: ['userCourses', 'category', 'courseType'],
      order: { createdAt: 'DESC' },
      take: 1,
    });

    results.push(...sameAll);
    usedIds.push(...sameAll.map((k) => k.id));

    // 2. category sama (1 data)
    const sameKategori = await this.courseRepository.find({
      where: {
        id: Not(In(usedIds)),
        launch: true,
        category: { id: course.category.id },
      },
      relations: ['userCourses', 'category', 'courseType'],
      order: { createdAt: 'DESC' },
      take: 1,
    });

    results.push(...sameKategori);
    usedIds.push(...sameKategori.map((k) => k.id));

    // 3. courseType sama (1 data)
    const sameJenis = await this.courseRepository.find({
      where: {
        id: Not(In(usedIds)),
        launch: true,
        courseType: { id: course.courseType.id },
      },
      relations: ['userCourses', 'category', 'courseType'],
      order: { createdAt: 'DESC' },
      take: 1,
    });

    results.push(...sameJenis);
    usedIds.push(...sameJenis.map((k) => k.id));
    // ðŸ”¥ fallback kalau kurang dari 3
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

  async checkUserInCourse(courseId: string, userId: string) {
    return await this.userCourseRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });
  }

  async findTechnologies() {
    return await this.technologiesRepository.find();
  }

  async findCourseTechnologies(courseId: string) {
    return await this.technologiesRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findCourseQuestions(courseId: string) {
    return await this.courseQuestionRepository.find({
      where: { course: { id: courseId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findProgramBenefit(courseId: string) {
    return await this.programBenefitRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findCourseParticipants(courseId: string) {
    return await this.participantsRepository.find({
      where: { course: { id: courseId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findCourseFlows(courseId: string) {
    return await this.courseFlowRepository.find({
      where: { course: { id: courseId } },
      order: { sequence: 'ASC' },
    });
  }

  async findOneCourse(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: [
        'category',
        'category.gallery',
        'category.benefit_category',
        'courseType',
        'technologies',
        'userCourses',
        'weeks',
        'programBenefits',
        'participants',
        'courseFlow',
      ],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async findOneUserCourse(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, launch: true },
      relations: [
        'category',
        'category.gallery',
        'category.benefit_category',
        'courseType',
        'userCourses',
        'userCourses.user',
        'programBenefits',
        'participants',
        'courseFlow',
      ],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async getUserCourseRelation(userId: string, courseId: string) {
    return await this.userCourseRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });
  }

  async findOnePortfolio(userId: string, courseId: string) {
    return await this.portfolioRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
  }

  async findOneUserLaunchCourse(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['category', 'courseType', 'userCourses', 'userCourses.user'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return course;
  }

  async findOneAdminCourse(courseId: string) {
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

  async findCourseWeeks(courseId: string) {
    return await this.weeksRepository.find({
      where: { course: { id: courseId } },
      order: { weekNumber: 'ASC' },
      relations: ['session'],
    });
  }

  async findCourseMentors(courseId: string) {
    return await this.mentorRepository.find({
      where: { course: { id: courseId } },
      relations: ['technologies'],
    });
  }

  async findCourseUsers(courseId: string) {
    return await this.userCourseRepository.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });
  }

  async findCoursePayments(courseId: string) {
    return await this.paymentRepository.find({
      where: { course: { id: courseId } },
      relations: ['user', 'course'],
    });
  }

  async findCourseRegistrations(courseId: string) {
    return await this.registrationRepository.find({
      where: { course: { id: courseId } },
      relations: ['user', 'course'],
    });
  }

  async findCoursePaymentInstallments(courseId: string) {
    return await this.paymentRepository.find({
      where: { course: { id: courseId }, installment: Not(IsNull()) },
      relations: ['user', 'course', 'installment'],
    });
  }

  async findCourseInstallments(courseId: string) {
    const installments = await this.installmentsRepository.find({
      where: { course: { id: courseId } },
      order: { month: 'ASC' },
    });

    return installments.map((i) => ({
      ...i,
      dueDates: dateHelpers.toDateOnlyArray(i.dueDates),
    }));
  }

  async findCourseAlumni(courseId: string) {
    return await this.alumniRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async findCourseMentoring(courseId: string) {
    return await this.userRepository.findOne({
      where: { mentoring: { course: { id: courseId } } },
    });
  }

  async findOne(courseId: string) {
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

  async updateLaunch(courseId: string, updateCourseDto: UpdateCoursesDto) {
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

  async toggleLaunch(courseId: string) {
    const course = await this.findOne(courseId);
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    course.launch = !course.launch;
    return await this.courseRepository.save(course);
  }

  async update(id: string, updateCourseDto: UpdateCoursesDto) {
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

    const { endDate, ...otherProperties } = updateCourseDto;
    // Relation-key tidak boleh ikut menjadi kolom entity via Object.assign.
    const persistable: Record<string, unknown> = { ...otherProperties };
    delete persistable.courseTypeId;
    delete persistable.categoryId;
    delete persistable.technologiesIds;
    delete persistable.mentoringsId;
    Object.assign(course, persistable);
    if (updateCourseDto.startDate) {
      course.startDate = new Date(updateCourseDto.startDate);
    }
    if (endDate) {
      course.startEnd = new Date(endDate);
    }
    if (updateCourseDto.date_registration) {
      course.date_registration = new Date(updateCourseDto.date_registration);
    }

    const saved = await this.courseRepository.save(course);
    // Program yang baru saja diubah menjadi non-bootcamp juga butuh wadahnya.
    await this.ensureSyllabusContainer(saved);
    return saved;
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    return await this.courseRepository.remove(course);
  }

  async removeCourseUser(userId: string, courseId: string) {
    const userCourses = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!userCourses) {
      throw new NotFoundException('User not found');
    }

    const hasPayment = await this.paymentRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (hasPayment) {
      throw new BadRequestException(
        'User tidak dapat dihapus dari program karena sudah memiliki riwayat pembayaran.',
      );
    }

    const hasRegistration = await this.registrationRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (hasRegistration) {
      throw new BadRequestException(
        'User tidak dapat dihapus dari program karena sudah memiliki riwayat registration.',
      );
    }

    return await this.userCourseRepository.remove(userCourses);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async findPortfolio(userId: string) {
    return await this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: [
        'user',
        'course',
        'course.courseType',
        'course.category',
        'course.technologies',
      ],
    });
  }

  async findCompletedCoursesByUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'userCourses',
        'userCourses.course',
        'userCourses.course.category',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const completedCourses = user.userCourses.filter(
      (uc) =>
        uc.progress === true && uc.course && uc.course.process === 'approved',
    );
    return { userCourses: completedCourses };
  }
}
