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
  private readonly kelasRepository: Repository<Course>;
  @InjectRepository(MentorLogbook)
  private readonly logBookMentorRepository: Repository<MentorLogbook>;
  @InjectRepository(SessionProgress)
  private readonly progresPertemuanRepository: Repository<SessionProgress>;
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

  async findByUser(userId: number) {
    return await this.logBookRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findLogBook(userId: number, courseId: number) {
    return await this.logBookRepository.find({
      where: {
        user: { id: userId },
        session: { weeks: { course: { id: courseId } } },
      },
      relations: [
        'user',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });
  }

  async findCourseByUser(userId: number) {
    return await this.kelasRepository.find({
      where: { userCourses: { user: { id: userId } } },
      relations: ['userCourses', 'userCourses.user', 'weeks'],
    });
  }

  async findAllCourses() {
    return await this.kelasRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findAll() {
    return await this.logBookRepository.find({
      relations: [
        'user',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });
  }

  async findLogBookMentor() {
    return await this.logBookMentorRepository.find({
      relations: [
        'user',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });
  }

  async findUsers(sessionId: number) {
    return await this.userRepository.find({
      where: {
        userCourses: {
          course: { weeks: { session: { id: sessionId } } },
        },
      },
      relations: ['userCourses', 'userCourses.user', 'userCourses.course'],
    });
  }

  async findSession(sessionId: number) {
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

  async findOne(logbookId: number) {
    const logbooks = await this.logBookRepository.findOne({
      where: { id: logbookId },
      relations: [
        'session',
        'session.weeks',
        'session.weeks.course',
        'user',
      ],
    });
    if (!logbooks) {
      throw new NotFoundException('log book not found');
    }
    return logbooks;
  }

  async update(logbookId: number, updateLogbookDto: UpdateLogbookDto) {
    const logbooks = await this.findOne(logbookId);
    if (!logbooks) {
      throw new NotFoundException('logbooks not found');
    }
    Object.assign(logbooks, updateLogbookDto);

    if (updateLogbookDto.process === 'acc') {
      const existingProgres = await this.progresPertemuanRepository.findOne({
        where: {
          user: { id: logbooks.user.id },
          session: { id: logbooks.session.id },
        },
        relations: ['session', 'session.weeks'],
      });

      if (existingProgres) {
        await this.progresPertemuanRepository.update(existingProgres.id, {
          logbook: true,
        });
      } else {
        await this.progresPertemuanRepository.save({
          user: { id: logbooks.user.id },
          session: { id: logbooks.session.id },
          logbook: true,
          attendances: true,
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
            const existingProgresQuiz =
              await this.progresQuizRepository.findOne({
                where: { quiz: { id: quiz.id }, user: { id: logbooks.user.id } },
              });
            if (existingProgresQuiz) {
              await this.progresQuizRepository.save({
                id: existingProgresQuiz.id,
                quiz: { id: quiz.id },
                user: { id: logbooks.user.id },
                proses: true,
              });
            } else {
              await this.progresQuizRepository.save({
                quiz: { id: quiz.id },
                user: { id: logbooks.user.id },
                proses: true,
              });
            }
          }
        } else {
          const pertemuan_selanjutnya = await this.sessionRepository.findOne({
            where: {
              sessionOrder: session.sessionOrder + 1,
              weeks: { id: session.weeks.id },
            },
          });

          if (pertemuan_selanjutnya) {
            const existingProgresPertemuan =
              await this.progresPertemuanRepository.findOne({
                where: {
                  user: { id: logbooks.user.id },
                  session: { id: pertemuan_selanjutnya.id },
                },
              });
            if (existingProgresPertemuan) {
              await this.progresPertemuanRepository.save({
                id: existingProgresPertemuan.id,
                session: { id: pertemuan_selanjutnya.id },
                user: { id: logbooks.user.id },
                attendances: true,
                logbook: false,
              });
            } else {
              await this.progresPertemuanRepository.save({
                session: { id: pertemuan_selanjutnya.id },
                user: { id: logbooks.user.id },
                attendances: true,
                logbook: false,
              });
            }
          }
        }
      }
    } else if (updateLogbookDto.process === 'rejected') {
      const existingProgres = await this.progresPertemuanRepository.findOne({
        where: {
          user: { id: logbooks.user.id },
          session: { id: logbooks.session.id },
        },
      });

      if (existingProgres) {
        await this.progresPertemuanRepository.update(existingProgres.id, {
          logbook: false,
        });
      } else {
        await this.progresPertemuanRepository.save({
          user: { id: logbooks.user.id },
          session: { id: logbooks.session.id },
          logbook: false,
        });
      }
    }

    return await this.logBookRepository.save(logbooks);
  }

  async remove(logbookId: number) {
    const logbooks = await this.findOne(logbookId);
    if (!logbooks) {
      throw new NotFoundException('logbooks not found');
    }
    await this.logBookRepository.remove(logbooks);
  }
}
