import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogbookMentorDto } from './dto/create-logbook_mentor.dto';
import { UpdateLogbookMentorDto } from './dto/update-logbook_mentor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LogbookMentorService {
  @InjectRepository(LogbookMentor)
  private readonly logBookMentorRepository: Repository<LogbookMentor>;
  @InjectRepository(Pertemuan)
  private readonly pertemuanRepository: Repository<Pertemuan>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Kelas)
  private readonly kelasRepository: Repository<Kelas>;

  async create(createLogbookMentorDto: CreateLogbookMentorDto) {
    const user = await this.userRepository.findOne({
      where: { id: createLogbookMentorDto.userId },
    });
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id: createLogbookMentorDto.pertemuanId },
    });
    if (!user) {
      throw new Error('User tidak ada');
    }
    if (!pertemuan) {
      throw new Error('pertemuan tidak ada');
    }
    const logbook = await this.logBookMentorRepository.create({
      ...createLogbookMentorDto,
      user: user,
      pertemuan: pertemuan,
    });
    return await this.logBookMentorRepository.save(logbook);
  }

  async getKelasList(userId: number) {
    return await this.kelasRepository.find({
      where: { mentoring: { user: { id: userId } } },
    });
  }

  async findOne(logbook_mentorId: number) {
    const logbook_mentor = await this.logBookMentorRepository.findOne({
      where: { id: logbook_mentorId },
      relations: ['pertemuan', 'user'],
    });
    if (!logbook_mentor) {
      throw new NotFoundException('logbook not found');
    }
    return logbook_mentor;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async update(
    logbook_mentorId: number,
    updateLogbookMentorDto: UpdateLogbookMentorDto,
  ) {
    const logbook = await this.findOne(logbook_mentorId);
    if (!logbook) {
      throw new NotFoundException('logbook not found');
    }
    Object.assign(logbook, updateLogbookMentorDto);
    return await this.logBookMentorRepository.save(logbook);
  }

  async remove(id: number) {
    const logbook = await this.findOne(id);
    if (!logbook) {
      throw new NotFoundException('logbook not found');
    }
    await this.logBookMentorRepository.remove(logbook);
  }
}
