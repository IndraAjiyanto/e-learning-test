import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Question } from 'src/entities/question.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { Assignment } from 'src/entities/assignment.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(Course)
    private readonly kelasRepository: Repository<Course>,

    @InjectRepository(Weeks)
    private readonly mingguRepository: Repository<Weeks>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Logbook)
    private readonly logBookRepository: Repository<Logbook>,

    @InjectRepository(Question)
    private readonly pertanyaanRepository: Repository<Question>,

    @InjectRepository(MentorLogbook)
    private readonly logbookMentorRepository: Repository<MentorLogbook>,

    @InjectRepository(SessionProgress)
    private readonly progresPertemuanRepository: Repository<SessionProgress>,

    @InjectRepository(WeekProgress)
    private readonly weekProgressRepository: Repository<WeekProgress>,

    @InjectRepository(Assignment)
    private readonly tugasRepository: Repository<Assignment>,
  ) {}

  async create(createSessionDto: CreateSessionDto) {
    if (createSessionDto.isFinalCheck === 'true') {
      createSessionDto.isFinal = true;
    } else {
      createSessionDto.isFinal = false;
    }
    const weeks = await this.mingguRepository.findOne({
      where: { id: createSessionDto.weeksId },
      relations: ['course'],
    });
    if (!weeks) {
      throw new NotFoundException('weeks ini tidak ada');
    }
    if (createSessionDto.sessionOrder === 1) {
      const data = await this.sessionRepository.create({
        ...createSessionDto,
        weeks: weeks,
      });
      const new_pertemuan = await this.sessionRepository.save(data);
      const weekProgress = await this.weekProgressRepository.find({
        where: { week: { id: weeks.id }, process: true },
        relations: ['user'],
      });
      if (weekProgress.length > 0) {
        for (const progres of weekProgress) {
          const existingProgresPertemuan =
            await this.progresPertemuanRepository.findOne({
              where: {
                session: { id: new_pertemuan.id },
                user: { id: progres.user.id },
              },
            });
          if (existingProgresPertemuan) {
            await this.progresPertemuanRepository.save({
              id: existingProgresPertemuan.id,
              logbook: false,
              isAttended: true,
              session: new_pertemuan,
              user: progres.user,
            });
          } else {
            await this.progresPertemuanRepository.save({
              logbook: false,
              isAttended: true,
              session: new_pertemuan,
              user: progres.user,
            });
          }
        }
      }
    } else {
      const session = await this.sessionRepository.findOne({
        where: {
          sessionOrder: createSessionDto.sessionOrder - 1,
          weeks: { id: weeks.id },
        },
      });

      if (!session) {
        throw new NotFoundException(
          'session sebelumnya harus dibuat terlebih dahulu',
        );
      } else if (!session.isFinal) {
        if (createSessionDto.isFinalCheck === 'true') {
          createSessionDto.isFinal = true;
        }
        const user = await this.sessionRepository.create({
          ...createSessionDto,
          weeks: weeks,
        });
        const new_pertemuan = await this.sessionRepository.save(user);
        const progresPertemuan = await this.progresPertemuanRepository.find({
          where: {
            session: { id: session.id },
            isAttended: true,
            logbook: true,
          },
          relations: ['user'],
        });
        if (progresPertemuan.length > 0) {
          for (const progres of progresPertemuan) {
            await this.progresPertemuanRepository.save({
              isAttended: true,
              logbook: false,
              session: new_pertemuan,
              user: progres.user,
            });
          }
        }
      }
    }
  }

  async findAllCourses() {
    return await this.kelasRepository.find();
  }

  async findWeekSessions(weeksId: number) {
    const session = await this.sessionRepository.findOne({
      where: { weeks: { id: weeksId } },
      order: { createdAt: 'DESC' },
    });
    if (!session) {
      return 0;
    }
    return session.sessionOrder;
  }

  async noPertemuan(weeksId: number) {
    const pertemuanTerakhir = await this.findWeekSessions(weeksId);
    const pertemuanBaru = pertemuanTerakhir + 1;
    return pertemuanBaru;
  }

  async findStudentsInCourse(courseId: number, sessionId: number) {
    return await this.userRepository.find({
      where: {
        userCourses: { course: { id: courseId } },
        absent: { session: { id: sessionId } },
      },
      relations: ['absent'],
    });
  }

  async findQuestions(sessionId: number) {
    return await this.pertanyaanRepository.find({
      where: { quiz: { id: sessionId } },
      relations: ['answers'],
    });
  }

  async findLogBook(sessionId: number) {
    return await this.logBookRepository.find({
      where: { session: { id: sessionId } },
      relations: [
        'user',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });
  }

  async findLogBookMentor(sessionId: number) {
    return await this.logbookMentorRepository.find({
      where: { session: { id: sessionId } },
      relations: [
        'user',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });
  }

  async findTugas(sessionId: number) {
    return await this.tugasRepository.find({
      where: { session: { id: sessionId } },
    });
  }

  async findOne(id: number) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['weeks', 'weeks.course'],
    });
    if (!session) {
      throw new NotFoundException(`Pertemuan tidak ditemukan`);
    }

    if (!session.weeks) {
      throw new NotFoundException('course tidak ditemukan');
    }

    return session;
  }

  async update(id: number, updateSessionDto: UpdateSessionDto) {
    const session = await this.findOne(id);
    if (!session) {
      throw new NotFoundException('session tidak ditemukan');
    }

    if (updateSessionDto.isFinalCheck === 'true') {
      updateSessionDto.isFinal = true;
    } else {
      updateSessionDto.isFinal = false;
    }
    Object.assign(session, updateSessionDto);
    return await this.sessionRepository.save(session);
  }

  async remove(sessionId: number, weeksId: number) {
    const session = await this.findOne(sessionId);
    if (!session) {
      throw new NotFoundException('session tidak ditemukan');
    }
    await this.sessionRepository.remove(session);
    const semuaPertemuan = await this.sessionRepository.find({
      where: { weeks: { id: weeksId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < semuaPertemuan.length; i++) {
      semuaPertemuan[i].sessionOrder = i + 1;
      await this.sessionRepository.save(semuaPertemuan[i]);
    }
  }
}
