import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentsDto } from './dto/create-assignments.dto';
import { UpdateAssignmentsDto } from './dto/update-assignments.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from 'src/entities/assignment.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AssignmentsService {
  @InjectRepository(Assignment)
  private readonly tugasRepository: Repository<Assignment>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;

  async create(createTugassDto: CreateAssignmentsDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: createTugassDto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('session ini tidak ada');
    }
    const task = await this.tugasRepository.create({
      ...createTugassDto,
      session: session,
    });
    return await this.tugasRepository.save(task);
  }

  async findOne(id: number) {
    const task = await this.tugasRepository.findOne({ where: { id: id } });
    if (!task) {
      throw new NotFoundException('assignments not found');
    }
    return task;
  }

  update(id: number, updateTugassDto: UpdateAssignmentsDto) {
    return `This action updates a #${id} tugass`;
  }
  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async remove(tugasId: number) {
    const task = await this.tugasRepository.findOne({
      where: { id: tugasId },
    });
    if (!task) {
      throw new NotFoundException('assignments tidak ditemukan');
    }
    await this.tugasRepository.remove(task);
  }
}
