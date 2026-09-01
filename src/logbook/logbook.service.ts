import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Logbook } from 'src/entities/logbook.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Quiz } from 'src/entities/quiz.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { QuizProgress } from 'src/entities/quiz_progress.entity';

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

    const logbooks = await this.logBookRepository.create({
      ...createLogbookDto,
      user: user,
      session: session,
    });
    return await this.logBookRepository.save(logbooks);
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
      relations: ['user', 'session', 'session.weeks', 'session.weeks.course'],
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
      relations: ['user', 'session', 'session.weeks', 'session.weeks.course'],
    });
  }

  async findMentorLogbook() {
    return await this.mentorLogbookRepository.find({
      relations: ['user', 'session', 'session.weeks', 'session.weeks.course'],
    });
  }

  async findUsers(sessionId: string) {
    return await this.userRepository.find({
      where: {
        userCourses: {
          course: { weeks: { session: { id: sessionId } } },
        },
      },
      relations: ['userCourses', 'userCourses.user', 'userCourses.course'],
    });
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
    } catch (error) {}
  }

  async findOne(logbookId: string) {
    const logbooks = await this.logBookRepository.findOne({
      where: { id: logbookId },
      relations: ['session', 'session.weeks', 'session.weeks.course', 'user'],
    });
    if (!logbooks) {
      throw new NotFoundException('log book not found');
    }
    return logbooks;
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
    Object.assign(logbooks, updateLogbookDto);

    if (updateLogbookDto.process === 'approved') {
      const existingProgress = await this.sessionProgressRepository.findOne({
        where: {
          user: { id: logbooks.user.id },
          session: { id: logbooks.session.id },
        },
        relations: ['session', 'session.weeks'],
      });

      if (existingProgress) {
        await this.sessionProgressRepository.update(existingProgress.id, {
          logbook: true,
        });
      } else {
        await this.sessionProgressRepository.save({
          user: { id: logbooks.user.id },
          session: { id: logbooks.session.id },
          logbook: true,
          isAttended: true,
        });
      }

      const session = await this.sessionRepository.findOne({
        where: { id: logbooks.session.id },
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
            const existingQuizProgress =
              await this.progresQuizRepository.findOne({
                where: {
                  quiz: { id: quiz.id },
                  user: { id: logbooks.user.id },
                },
              });
            if (existingQuizProgress) {
              await this.progresQuizRepository.save({
                id: existingQuizProgress.id,
                quiz: { id: quiz.id },
                user: { id: logbooks.user.id },
                process: true,
              });
            } else {
              await this.progresQuizRepository.save({
                quiz: { id: quiz.id },
                user: { id: logbooks.user.id },
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
                  user: { id: logbooks.user.id },
                  session: { id: nextSession.id },
                },
              });
            if (existingSessionProgress) {
              await this.sessionProgressRepository.save({
                id: existingSessionProgress.id,
                session: { id: nextSession.id },
                user: { id: logbooks.user.id },
                isAttended: true,
                logbook: false,
              });
            } else {
              await this.sessionProgressRepository.save({
                session: { id: nextSession.id },
                user: { id: logbooks.user.id },
                isAttended: true,
                logbook: false,
              });
            }
          }
        }
      }
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

  async remove(logbookId: string) {
    const logbooks = await this.findOne(logbookId);
    if (!logbooks) {
      throw new NotFoundException('logbooks not found');
    }
    await this.logBookRepository.remove(logbooks);
  }
}
