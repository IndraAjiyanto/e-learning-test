import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssignmentsDto } from './dto/create-assignments.dto';
import { UpdateAssignmentsDto } from './dto/update-assignments.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from 'src/entities/assignment.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { AnswerTask } from 'src/entities/answer_task.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AssignmentsService {
  @InjectRepository(Assignment)
  private readonly assignmentRepository: Repository<Assignment>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;
  @InjectRepository(AnswerTask)
  private readonly answerTaskRepository: Repository<AnswerTask>;

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

  async hasApprovedSubmission(assignmentId: string): Promise<boolean> {
    const count = await this.answerTaskRepository.count({
      where: {
        task: { id: assignmentId },
        process: 'approved',
      },
    });
    return count > 0;
  }

  async findOne(id: string) {
    const task = await this.assignmentRepository.findOne({
      where: { id: id },
      relations: ['session'],
    });
    if (!task) {
      throw new NotFoundException('Assignment not found');
    }
    return task;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentsDto) {
    const task = await this.findOne(id);
    const isCompleted = await this.hasApprovedSubmission(id);
    if (isCompleted) {
      throw new BadRequestException(
        'Assignment cannot be edited because it has already been completed by user',
      );
    }
    Object.assign(task, updateAssignmentDto);
    return await this.assignmentRepository.save(task);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async remove(assignmentId: string) {
    const task = await this.findOne(assignmentId);
    const isCompleted = await this.hasApprovedSubmission(assignmentId);
    if (isCompleted) {
      throw new BadRequestException(
        'Assignment cannot be deleted because it has already been completed by user',
      );
    }
    await this.assignmentRepository.remove(task);
  }
}

