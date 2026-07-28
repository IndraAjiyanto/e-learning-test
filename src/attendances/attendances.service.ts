import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-absen.dto';
import { UpdateAttendanceDto } from './dto/update-absen.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendance.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';

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
    private readonly progresPertemuanRepository: Repository<SessionProgress>,

    @InjectRepository(Course)
    private readonly kelasRepository: Repository<Course>,
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
      throw new NotFoundException('session ini tidak ada');
    }
    if (!user) {
      throw new NotFoundException('user ini tidak ada');
    }
    const attendance = await this.attendanceRepository.create({
      ...CreateAttendanceDto,
      session: session,
      user: user,
    });

    return await this.attendanceRepository.save(attendance);
  }

  async findAll() {
    return await this.attendanceRepository.find({
      relations: ['session', 'session.weeks', 'session.weeks.course', 'user'],
    });
  }

  async findSession(sessionId: number) {
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });
  }

  async findUsers(sessionId: number) {
    const course = await this.kelasRepository.findOne({
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
    return await this.kelasRepository.find({ relations: ['session'] });
  }

  async findOne(id: number) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['session', 'session.weeks', 'session.weeks.course', 'user'],
    });
    if (!attendance) {
      throw new NotFoundException(`attendance tidak ditemukan`);
    }

    if (!attendance.session) {
      throw new NotFoundException('session tidak ditemukan');
    }

    if (!attendance.user) {
      throw new NotFoundException('user tidak ditemukan');
    }
    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.findOne(id);
    if (!attendance) {
      throw new NotFoundException('attendance tidak ditemukan');
    }
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: number, sessionId: number) {
    const attendance = await this.findOne(id);
    if (!attendance) {
      throw new NotFoundException('attendance tidak ditemukan');
    }
    const sessionProgress = await this.progresPertemuanRepository.findOne({
      where: { user: { id: attendance.user.id }, session: { id: sessionId } },
    });

    if (sessionProgress) {
      await this.progresPertemuanRepository.remove(sessionProgress);
    }
    return await this.attendanceRepository.remove(attendance);
  }
}
