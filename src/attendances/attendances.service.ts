import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendance.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Logbook } from 'src/entities/logbook.entity';

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

    @InjectRepository(Logbook)
    private readonly logBookRepository: Repository<Logbook>,
  ) {}

  async create(CreateAttendanceDto: CreateAttendanceDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: CreateAttendanceDto.sessionId },
      relations: ['weeks'],
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
    const duplicate = await this.attendanceRepository.findOne({
      where: {
        session: { id: CreateAttendanceDto.sessionId },
        user: { id: CreateAttendanceDto.userId },
      },
    });
    if (duplicate) {
      throw new NotFoundException(
        'User has already submitted attendance for this session',
      );
    }
    const attendance = this.attendanceRepository.create({
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

    return saved;
  }

  async findAll() {
    const attendances = await this.attendanceRepository.find({
      relations: ['session', 'session.weeks', 'session.weeks.course', 'user'],
    });

    if (attendances.length === 0) {
      return [];
    }

    const approvedLogbooks = await this.logBookRepository.find({
      where: { process: 'approved' },
      relations: ['user', 'session'],
    });

    const approvedUserSessionSet = new Set(
      approvedLogbooks
        .map((lb) => `${lb.user?.id}:${lb.session?.id}`)
        .filter(Boolean),
    );

    return attendances.map((att) => ({
      ...att,
      canDelete: !approvedUserSessionSet.has(
        `${att.user?.id}:${att.session?.id}`,
      ),
    }));
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
      return [];
    }
    const enrolled = await this.userRepository.find({
      where: { role: 'user', userCourses: { course: { id: course.id } } },
    });
    if (!enrolled.length) {
      return [];
    }
    // Exclude users who already have an attendance record for this session,
    // so they don't show up again in the admin "Add Attendance" dropdown.
    const existing = await this.attendanceRepository.find({
      where: { session: { id: sessionId } },
      relations: ['user'],
    });
    const attendedIds = new Set(
      existing.map((a) => a.user?.id).filter(Boolean),
    );
    return enrolled.filter((u) => !attendedIds.has(u.id));
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

    const approvedLogbook = await this.logBookRepository.findOne({
      where: {
        user: { id: attendance.user.id },
        session: { id: sessionId },
        process: 'approved',
      },
    });

    if (approvedLogbook) {
      throw new BadRequestException(
        'Cannot delete attendance because the user has an approved logbook in this session.',
      );
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
