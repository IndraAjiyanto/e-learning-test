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
  private readonly assignmentRepository: Repository<Assignment>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;

  async create(createAssignmentDto: CreateAssignmentsDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: createAssignmentDto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    const task = await this.assignmentRepository.create({
      ...createAssignmentDto,
      session: session,
    });
    return await this.assignmentRepository.save(task);
  }

  async findOne(id: number) {
    const task = await this.assignmentRepository.findOne({ where: { id: id } });
    if (!task) {
      throw new NotFoundException('assignments not found');
    }
    return task;
  }

  update(id: number, updateAssignmentDto: UpdateAssignmentsDto) {
    return `This action updates a #${id} assignments`;
  }
  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async remove(assignmentId: number) {
    const task = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });
    if (!task) {
      throw new NotFoundException('Assignment not found');
    }
    await this.assignmentRepository.remove(task);
  }
}
