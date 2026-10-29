import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Logbook } from 'src/entities/logbook.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { capabilitiesForCourse } from 'src/courses/program-type';
import { Session } from 'src/entities/session.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Quiz } from 'src/entities/quiz.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { QuizProgress } from 'src/entities/quiz_progress.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { Score } from 'src/entities/score.entity';

@Injectable()
export class LogbookService {
  @InjectRepository(Logbook)
  private readonly logBookRepository: Repository<Logbook>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;
  @InjectRepository(Course)
  private readonly courseRepository: Repository<Course>;
  @InjectRepository(MentorLogbook)
  private readonly mentorLogbookRepository: Repository<MentorLogbook>;
  @InjectRepository(SessionProgress)
  private readonly sessionProgressRepository: Repository<SessionProgress>;
  @InjectRepository(Quiz)
  private readonly quizRepository: Repository<Quiz>;
  @InjectRepository(QuizProgress)
  private readonly progresQuizRepository: Repository<QuizProgress>;
  @InjectRepository(Attendance)
  private readonly attendanceRepository: Repository<Attendance>;
  @InjectRepository(AnswerTask)
  private readonly answerTaskRepository: Repository<AnswerTask>;
  @InjectRepository(Score)
  private readonly scoreRepository: Repository<Score>;

  async create(createLogbookDto: CreateLogbookDto) {
    const user = await this.userRepository.findOne({
      where: { id: createLogbookDto.userId },
    });
    const session = await this.sessionRepository.findOne({
      where: { id: createLogbookDto.sessionId },
    });
    if (!user) {
      throw new Error('User tidak ada');
    }
    if (!session) {
      throw new Error('session tidak ada');
    }

    const existingLogbook = await this.logBookRepository.findOne({
      where: {
        user: { id: user.id },
        session: { id: session.id },
      },
    });
    if (existingLogbook) {
      throw new BadRequestException(
        'This user already has a logbook for this session.',
      );
    }

    const logbooks = this.logBookRepository.create({
      ...createLogbookDto,
      user: user,
      session: session,
    });
    const saved = await this.logBookRepository.save(logbooks);

    if (createLogbookDto.process === 'approved') {
      await this.applyLogbookApproved(user.id, session.id);
    }

    return saved;
  }

  private async applyLogbookApproved(userId: string, sessionId: string) {
    const existingProgress = await this.sessionProgressRepository.findOne({
      where: {
        user: { id: userId },
        session: { id: sessionId },
      },
      relations: ['session', 'session.weeks'],
    });

    if (existingProgress) {
      await this.sessionProgressRepository.update(existingProgress.id, {
        logbook: true,
        isAttended: true,
      });
    } else {
      await this.sessionProgressRepository.save({
        user: { id: userId },
        session: { id: sessionId },
        logbook: true,
        isAttended: true,
      });
    }

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        session: { id: sessionId },
      },
    });
    if (!existingAttendance) {
      await this.attendanceRepository.save(
        this.attendanceRepository.create({
          user: { id: userId },
          session: { id: sessionId },
          status: 'present',
          attendanceTime: new Date(),
          notes: 'Hadir (diverifikasi admin melalui logbook)',
        }),
      );
    }

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });
    if (session) {
      if (session.isFinal) {
        const quiz = await this.quizRepository.findOne({
          where: {
            weeks: { id: session.weeks.id },
          },
        });
        if (quiz) {
          const existingQuizProgress = await this.progresQuizRepository.findOne({
            where: {
              quiz: { id: quiz.id },
              user: { id: userId },
            },
          });
          if (existingQuizProgress) {
            await this.progresQuizRepository.save({
              id: existingQuizProgress.id,
              quiz: { id: quiz.id },
              user: { id: userId },
              process: true,
            });
          } else {
            await this.progresQuizRepository.save({
              quiz: { id: quiz.id },
              user: { id: userId },
              process: true,
            });
          }
        }
      } else {
        const nextSession = await this.sessionRepository.findOne({
          where: {
            sessionOrder: session.sessionOrder + 1,
            weeks: { id: session.weeks.id },
          },
        });

        if (nextSession) {
          const existingSessionProgress =
            await this.sessionProgressRepository.findOne({
              where: {
                user: { id: userId },
                session: { id: nextSession.id },
              },
            });
          if (existingSessionProgress) {
            await this.sessionProgressRepository.save({
              id: existingSessionProgress.id,
              session: { id: nextSession.id },
              user: { id: userId },
              isAttended: true,
              logbook: existingSessionProgress.logbook ?? false,
            });
          } else {
            await this.sessionProgressRepository.save({
              session: { id: nextSession.id },
              user: { id: userId },
              isAttended: true,
              logbook: false,
            });
          }
        }
      }
    }
  }

  private async revertLogbookApproved(userId: string, sessionId: string) {
    const currentProgress = await this.sessionProgressRepository.findOne({
      where: {
        user: { id: userId },
        session: { id: sessionId },
      },
    });

    if (currentProgress) {
      await this.sessionProgressRepository.update(currentProgress.id, {
        logbook: false,
      });
    }

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });

    if (session) {
      if (session.isFinal) {
        const quiz = await this.quizRepository.findOne({
          where: {
            weeks: { id: session.weeks.id },
          },
        });
        if (quiz) {
          await this.progresQuizRepository.delete({
            quiz: { id: quiz.id },
            user: { id: userId },
          });
        }
      } else {
        const nextSession = await this.sessionRepository.findOne({
          where: {
            sessionOrder: session.sessionOrder + 1,
            weeks: { id: session.weeks.id },
          },
        });

        if (nextSession) {
          const nextSessionProgress =
            await this.sessionProgressRepository.findOne({
              where: {
                user: { id: userId },
                session: { id: nextSession.id },
              },
            });
          if (nextSessionProgress) {
            await this.sessionProgressRepository.remove(nextSessionProgress);
          }
        }
      }
    }
  }

  async findByUser(userId: string) {
    return await this.logBookRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findLogBook(userId: string, courseId: string) {
    return await this.logBookRepository.find({
      where: {
        user: { id: userId },
        session: { weeks: { course: { id: courseId } } },
      },
      relations: [
        'user',
        'user.biodata',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });
  }

  async findCourseByUser(userId: string) {
    return await this.courseRepository.find({
      where: { userCourses: { user: { id: userId } } },
      relations: ['userCourses', 'userCourses.user', 'weeks'],
    });
  }

  async findAllCourses() {
    return await this.courseRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return await this.logBookRepository.find({
      relations: [
        'user',
        'user.biodata',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });
  }

  async findMentorLogbook() {
    return await this.mentorLogbookRepository.find({
      relations: ['user', 'session', 'session.weeks', 'session.weeks.course'],
    });
  }

  async findUsers(sessionId: string) {
    const existingLogbooks = await this.logBookRepository.find({
      where: { session: { id: sessionId } },
      relations: ['user'],
    });
    const userIdsWithLogbook = new Set(
      existingLogbooks.map((lb) => lb.user?.id).filter(Boolean),
    );

    const attendances = await this.attendanceRepository.find({
      where: { session: { id: sessionId } },
      relations: ['user', 'user.biodata'],
    });

    const uniqueUsersMap = new Map<string, User>();
    for (const att of attendances) {
      const u = att.user;
      if (u && !userIdsWithLogbook.has(u.id)) {
        if (!uniqueUsersMap.has(u.id)) {
          uniqueUsersMap.set(u.id, u);
        }
      }
    }

    return Array.from(uniqueUsersMap.values());
  }

  async findSession(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
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

  async findOne(logbookId: string) {
    const logbooks = await this.logBookRepository.findOne({
      where: { id: logbookId },
      relations: [
        'session',
        'session.weeks',
        'session.weeks.course',
        'user',
        'user.biodata',
      ],
    });
    if (!logbooks) {
      throw new NotFoundException('log book not found');
    }
    return logbooks;
  }

  /**
   * Apakah program yang menaungi sebuah sesi memang memakai logbook.
   *
   * Dipakai rute logbook student sebagai penjaga: pada program SPL yang
   * logbooknya dimatikan, antarmukanya memang sudah tidak menampilkan tombol
   * apa pun, tetapi URL-nya masih bisa diketik langsung atau tersimpan di
   * riwayat peramban. Tanpa penjaga ini, logbook masih bisa dibuat untuk
   * program yang seharusnya tidak punya logbook sama sekali.
   */
  async logbookEnabledForSession(sessionId: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });
    return capabilitiesForCourse(session?.weeks?.course ?? null).logbookEnabled;
  }

  async logbookEnabledForCourse(courseId: string): Promise<boolean> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    return capabilitiesForCourse(course).logbookEnabled;
  }

  async findCapstoneProjects(kategoriId?: string) {
    const query = this.logBookRepository
      .createQueryBuilder('logbook')
      .where('logbook.documentation IS NOT NULL')
      .andWhere('logbook.documentation != :empty', { empty: '' })
      .orderBy('logbook.createdAt', 'DESC');

    // Join necessary relations to filter by kategoriId
    query
      .leftJoin('logbook.pertemuan', 'pertemuan')
      .leftJoin('pertemuan.minggu', 'minggu')
      .leftJoin('minggu.kelas', 'kelas');

    if (kategoriId) {
      query.andWhere('kelas.id = :kategoriId', {
        kategoriId,
      });
    }

    return query.getMany();
  }

  async update(logbookId: string, updateLogbookDto: UpdateLogbookDto) {
    const logbooks = await this.findOne(logbookId);
    if (!logbooks) {
      throw new NotFoundException('logbooks not found');
    }
    const previousProcess = logbooks.process;
    Object.assign(logbooks, updateLogbookDto);

    if (updateLogbookDto.process === 'approved') {
      await this.applyLogbookApproved(logbooks.user.id, logbooks.session.id);
    } else if (
      previousProcess === 'approved' &&
      (updateLogbookDto.process === 'rejected' ||
        updateLogbookDto.process === 'process')
    ) {
      await this.revertLogbookApproved(logbooks.user.id, logbooks.session.id);
    } else if (updateLogbookDto.process === 'rejected') {
      const existingProgress = await this.sessionProgressRepository.findOne({
        where: {
          user: { id: logbooks.user.id },
          session: { id: logbooks.session.id },
        },
      });

      if (existingProgress) {
        await this.sessionProgressRepository.update(existingProgress.id, {
          logbook: false,
        });
      } else {
        await this.sessionProgressRepository.save({
          user: { id: logbooks.user.id },
          session: { id: logbooks.session.id },
          logbook: false,
        });
      }
    }

    return await this.logBookRepository.save(logbooks);
  }

  async canDeleteLogbook(logbook: Logbook): Promise<boolean> {
    let session = logbook?.session;
    const user = logbook?.user;

    if (!session?.weeks?.course) {
      if (session?.id) {
        session =
          (await this.sessionRepository.findOne({
            where: { id: session.id },
            relations: ['weeks', 'weeks.course'],
          })) ?? session;
      }
    }

    if (!session?.weeks?.course || !user?.id) {
      return true;
    }

    const courseId = session.weeks.course.id;
    const currentWeekNumber = session.weeks.weekNumber;
    const currentOrder = session.sessionOrder;
    const userId = user.id;

    // If current session is final, check if user has attempted/completed quiz in this week
    if (session.isFinal && session.weeks?.id) {
      const hasScore = await this.scoreRepository
        .createQueryBuilder('sc')
        .innerJoin('sc.quiz', 'q')
        .innerJoin('q.weeks', 'w')
        .innerJoin('sc.user', 'u')
        .where('w.id = :weekId', { weekId: session.weeks.id })
        .andWhere('u.id = :userId', { userId })
        .getCount();

      if (hasScore > 0) return false;
    }

    const subsequentSessions = await this.sessionRepository
      .createQueryBuilder('s')
      .innerJoin('s.weeks', 'w')
      .innerJoin('w.course', 'c')
      .where('c.id = :courseId', { courseId })
      .andWhere(
        '((w.weekNumber = :currentWeekNumber AND s.sessionOrder > :currentOrder) OR (w.weekNumber > :currentWeekNumber))',
        { currentWeekNumber, currentOrder },
      )
      .select(['s.id'])
      .getMany();

    if (subsequentSessions.length === 0) {
      return true;
    }

    const subsequentSessionIds = subsequentSessions.map((s) => s.id);

    const hasAttendance = await this.attendanceRepository
      .createQueryBuilder('a')
      .innerJoin('a.session', 's')
      .innerJoin('a.user', 'u')
      .where('s.id IN (:...subsequentSessionIds)', { subsequentSessionIds })
      .andWhere('u.id = :userId', { userId })
      .getCount();

    if (hasAttendance > 0) return false;

    const hasLogbook = await this.logBookRepository
      .createQueryBuilder('lb')
      .innerJoin('lb.session', 's')
      .innerJoin('lb.user', 'u')
      .where('s.id IN (:...subsequentSessionIds)', { subsequentSessionIds })
      .andWhere('u.id = :userId', { userId })
      .getCount();

    if (hasLogbook > 0) return false;

    const hasAnswerTask = await this.answerTaskRepository
      .createQueryBuilder('at')
      .innerJoin('at.task', 'asg')
      .innerJoin('asg.session', 's')
      .innerJoin('at.user', 'u')
      .where('s.id IN (:...subsequentSessionIds)', {
        subsequentSessionIds,
      })
      .andWhere('u.id = :userId', { userId })
      .getCount();

    if (hasAnswerTask > 0) return false;

    return true;
  }

  async remove(logbookId: string) {
    const logbooks = await this.findOne(logbookId);
    if (!logbooks) {
      throw new NotFoundException('logbooks not found');
    }
    const canDelete = await this.canDeleteLogbook(logbooks);
    if (!canDelete) {
      throw new BadRequestException(
        'Cannot delete logbook because the user has already entered or attended a subsequent session or completed the quiz.',
      );
    }

    if (logbooks.process === 'approved') {
      await this.revertLogbookApproved(logbooks.user.id, logbooks.session.id);
    }

    await this.logBookRepository.remove(logbooks);
  }
}
