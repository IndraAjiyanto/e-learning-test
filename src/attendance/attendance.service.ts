import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendance.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ProgresPertemuan)
    private readonly progresPertemuanRepository: Repository<ProgresPertemuan>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  async create(CreateAttendanceDto: CreateAttendanceDto) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id: CreateAttendanceDto.pertemuanId },
      relations: ['minggu'],
    });
    const user = await this.userRepository.findOne({
      where: { id: CreateAttendanceDto.userId },
    });
    if (!pertemuan) {
      throw new NotFoundException('session not found');
    }
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const attendance = await this.attendanceRepository.create({
      ...CreateAttendanceDto,
      pertemuan: pertemuan,
      user: user,
    });

    return await this.attendanceRepository.save(attendance);
  }

  async findAll() {
    return await this.attendanceRepository.find({
      relations: ['pertemuan', 'user', 'pertemuan.kelas'],
    });
  }

  async findPertemuan(pertemuanId: number) {
    return await this.pertemuanRepository.findOne({
      where: { id: pertemuanId },
      relations: ['minggu', 'minggu.kelas'],
    });
  }

  async findUsers(pertemuanId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { minggu: { pertemuan: { id: pertemuanId } } },
    });
    if (!kelas) {
      return '';
    }
    return await this.userRepository.find({
      where: { role: 'user', user_kelas: { kelas: { id: kelas.id } } },
    });
  }

  async findKelas() {
    return await this.kelasRepository.find({ relations: ['pertemuan'] });
  }

  async findOne(attendanceId: string) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id: attendanceId },
      relations: ['pertemuan', 'user'],
    });
    if (!attendance) {
      throw new NotFoundException(`attendance not found`);
    }

    if (!attendance.pertemuan) {
      throw new NotFoundException('session not found');
    }

    if (!attendance.user) {
      throw new NotFoundException('user not found');
    }
    return attendance;
  }

  async update(attendanceId: string, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.findOne(attendanceId);
    if (!attendance) {
      throw new NotFoundException('attendance not found');
    }
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async remove(attendanceId: string, pertemuanId: number) {
    const attendance = await this.findOne(attendanceId);
    if (!attendance) {
      throw new NotFoundException('attendance not found');
    }
    const progres_pertemuan = await this.progresPertemuanRepository.findOne({
      where: { user: { id: attendance.user.id }, pertemuan: { id: pertemuanId } },
    });

    if (progres_pertemuan) {
      await this.progresPertemuanRepository.remove(progres_pertemuan);
    }
    return await this.attendanceRepository.remove(attendance);
  }
}
