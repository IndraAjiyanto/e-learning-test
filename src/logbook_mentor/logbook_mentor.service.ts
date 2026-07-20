import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogbookMentorDto } from './dto/create-logbook_mentor.dto';
import { UpdateLogbookMentorDto } from './dto/update-logbook_mentor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LogbookMentorService {
  @InjectRepository(LogbookMentor)
  private readonly logBookMentorRepository: Repository<LogbookMentor>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Course)
  private readonly kelasRepository: Repository<Course>;

  async create(createLogbookMentorDto: CreateLogbookMentorDto) {
    const user = await this.userRepository.findOne({
      where: { id: createLogbookMentorDto.userId },
    });
    const session = await this.sessionRepository.findOne({
      where: { id: createLogbookMentorDto.sessionId },
    });
    if (!user) {
      throw new Error('User tidak ada');
    }
    if (!session) {
      throw new Error('session tidak ada');
    }
    const logbooks = await this.logBookMentorRepository.create({
      ...createLogbookMentorDto,
      user: user,
      session: session,
    });
    return await this.logBookMentorRepository.save(logbooks);
  }

  async getKelasList(userId: number) {
    return await this.kelasRepository.find({
      where: { mentorings: { user: { id: userId } } },
    });
  }

  async findOne(logbook_mentorId: number) {
    const logbook_mentor = await this.logBookMentorRepository.findOne({
      where: { id: logbook_mentorId },
      relations: ['session', 'user'],
    });
    if (!logbook_mentor) {
      throw new NotFoundException('logbooks not found');
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
    const logbooks = await this.findOne(logbook_mentorId);
    if (!logbooks) {
      throw new NotFoundException('logbooks not found');
    }
    Object.assign(logbooks, updateLogbookMentorDto);
    return await this.logBookMentorRepository.save(logbooks);
  }

  async remove(id: number) {
    const logbooks = await this.findOne(id);
    if (!logbooks) {
      throw new NotFoundException('logbooks not found');
    }
    await this.logBookMentorRepository.remove(logbooks);
  }
}
