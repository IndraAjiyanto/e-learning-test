import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMentorLogbookDto } from './dto/create-mentor_logbook.dto';
import { UpdateMentorLogbookDto } from './dto/update-mentor_logbook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MentorLogbookService {
  @InjectRepository(MentorLogbook)
  private readonly logBookMentorRepository: Repository<MentorLogbook>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Course)
  private readonly kelasRepository: Repository<Course>;

  async create(createMentorLogbookDto: CreateMentorLogbookDto) {
    const user = await this.userRepository.findOne({
      where: { id: createMentorLogbookDto.userId },
    });
    const session = await this.sessionRepository.findOne({
      where: { id: createMentorLogbookDto.sessionId },
    });
    if (!user) {
      throw new Error('User tidak ada');
    }
    if (!session) {
      throw new Error('session tidak ada');
    }
    const logbooks = await this.logBookMentorRepository.create({
      ...createMentorLogbookDto,
      user: user,
      session: session,
    });
    return await this.logBookMentorRepository.save(logbooks);
  }

  async getCourseList(userId: number) {
    return await this.kelasRepository.find({
      where: { mentorings: { user: { id: userId } } },
    });
  }

  async findOne(mentor_logbookId: number) {
    const mentor_logbook = await this.logBookMentorRepository.findOne({
      where: { id: mentor_logbookId },
      relations: ['session', 'user'],
    });
    if (!mentor_logbook) {
      throw new NotFoundException('logbooks not found');
    }
    return mentor_logbook;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async update(
    mentor_logbookId: number,
    updateMentorLogbookDto: UpdateMentorLogbookDto,
  ) {
    const logbooks = await this.findOne(mentor_logbookId);
    if (!logbooks) {
      throw new NotFoundException('logbooks not found');
    }
    Object.assign(logbooks, updateMentorLogbookDto);
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
