import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendance.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { capabilitiesForCourse } from 'src/courses/program-type';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(SessionProgress)
    private readonly sessionProgressRepository: Repository<SessionProgress>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(CreateAttendanceDto: CreateAttendanceDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: CreateAttendanceDto.sessionId },
      relations: ['weeks', 'weeks.course'],
    });
    const user = await this.userRepository.findOne({
      where: { id: CreateAttendanceDto.userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const attendance = await this.attendanceRepository.create({
      ...CreateAttendanceDto,
      session: session,
      user: user,
    });

    const saved = await this.attendanceRepository.save(attendance);

    // Mirrors the upsert pattern used elsewhere (courses.service.ts,
    // payments.service.ts, logbook.service.ts, session.service.ts) for
    // writing to SessionProgress. Without this, a real attendance
    // submission never flips sessionProgress.isAttended, so the
    // frontend's isAttended() (which requires both this row AND that
    // flag) can never become true through normal use.
    const existingSessionProgress =
      await this.sessionProgressRepository.findOne({
        where: { user: { id: user.id }, session: { id: session.id } },
      });
    if (existingSessionProgress) {
      await this.sessionProgressRepository.save({
        id: existingSessionProgress.id,
        isAttended: true,
      });
    } else {
      await this.sessionProgressRepository.save({
        user,
        session,
        isAttended: true,
        logbook: false,
      });
    }

    await this.openNextSessionWhenLogbookIsOff(session, user.id);

    return saved;
  }

  /**
   * Membuka sesi berikutnya pada program yang logbooknya dimatikan.
   *
   * Ini SISI KEDUA dari jebakan yang disebut docs/program-type-plan.md bagian
   * 5. Sisi pertama - syarat penguncian yang menuntut logbook - sudah
   * dilonggarkan di sessionUnlock.logbookApproved. Tetapi baris
   * `session_progresses` milik sesi BERIKUTNYA hanya pernah dibuat oleh
   * LogbookService.update saat admin menyetujui sebuah logbook
   * (logbook.service.ts:283). Pada program tanpa logbook, tidak ada satu pun
   * jalan yang membuat baris itu, sehingga daftar sesi tetap menggambar sesi
   * berikutnya sebagai terkunci meski aturannya sudah membolehkan.
   *
   * Karena itu di sini absensi mengambil alih tugas tersebut - dan HANYA pada
   * program yang memang tidak memakai logbook. Pada bootcamp urutannya tidak
   * berubah sama sekali: logbook yang disetujui tetap yang membuka sesi
   * berikutnya.
   */
  private async openNextSessionWhenLogbookIsOff(
    session: Session,
    userId: string,
  ): Promise<void> {
    if (capabilitiesForCourse(session.weeks?.course ?? null).logbookEnabled) {
      return;
    }

    const nextSession = await this.sessionRepository.findOne({
      where: {
        weeks: { id: session.weeks.id },
        sessionOrder: session.sessionOrder + 1,
      },
    });
    if (!nextSession) return;

    const existing = await this.sessionProgressRepository.findOne({
      where: { user: { id: userId }, session: { id: nextSession.id } },
    });
    if (existing) {
      if (existing.isAttended) return;
      await this.sessionProgressRepository.save({
        id: existing.id,
        isAttended: true,
      });
      return;
    }
    await this.sessionProgressRepository.save({
      user: { id: userId },
      session: { id: nextSession.id },
      isAttended: true,
      logbook: false,
    });
  }

  async findAll() {
    return await this.attendanceRepository.find({
      relations: ['session', 'session.weeks', 'session.weeks.course', 'user'],
    });
  }

  async findSession(sessionId: string) {
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });
  }

  async findUsers(sessionId: string) {
    const course = await this.courseRepository.findOne({
      where: { weeks: { session: { id: sessionId } } },
    });
    if (!course) {
      return '';
    }
    return await this.userRepository.find({
      where: { role: 'user', userCourses: { course: { id: course.id } } },
    });
  }

  async findCourse() {
    return await this.courseRepository.find({ relations: ['session'] });
  }

  async findOne(id: string) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['session', 'session.weeks', 'session.weeks.course', 'user'],
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance not found`);
    }

    if (!attendance.session) {
      throw new NotFoundException('Session not found');
    }

    if (!attendance.user) {
      throw new NotFoundException('User not found');
    }
    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.findOne(id);
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: string, sessionId: string) {
    const attendance = await this.findOne(id);
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }
    const sessionProgress = await this.sessionProgressRepository.findOne({
      where: { user: { id: attendance.user.id }, session: { id: sessionId } },
    });

    if (sessionProgress) {
      await this.sessionProgressRepository.remove(sessionProgress);
    }
    return await this.attendanceRepository.remove(attendance);
  }
}
