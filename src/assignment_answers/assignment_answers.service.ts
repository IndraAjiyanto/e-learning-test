import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentAnswersDto } from './dto/create-assignment_answers.dto';
import { UpdateAssignmentAnswersDto } from './dto/update-assignment_answers.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { Comment } from 'src/entities/comment.entity';

@Injectable()
export class AnswerTasksService {
  @InjectRepository(AnswerTask)
  private readonly assignmentAnswerRepository: Repository<AnswerTask>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Assignment)
  private readonly assignmentRepository: Repository<Assignment>;
  @InjectRepository(Comment)
  private readonly commentRepository: Repository<Comment>;

  async create(createAssignmentAnswerDto: CreateAssignmentAnswersDto) {
    const user = await this.userRepository.findOne({
      where: { id: createAssignmentAnswerDto.userId },
    });
    const assignments = await this.assignmentRepository.findOne({
      where: { id: createAssignmentAnswerDto.taskId },
    });
    if (!user) {
      throw new NotFoundException('user Not found');
    }
    if (!assignments) {
      throw new NotFoundException('assignments Not found');
    }
    const taskAnswers = await this.assignmentAnswerRepository.create({
      file: createAssignmentAnswerDto.file,
      process: createAssignmentAnswerDto.process,
      user: user,
      task: assignments,
    });
    return await this.assignmentAnswerRepository.save(taskAnswers);
  }

  async createComment(commentText: string, assignment_answerId: number) {
    const answersTask = await this.assignmentAnswerRepository.findOne({
      where: { id: assignment_answerId },
    });
    if (!answersTask) {
      throw new NotFoundException('answer not found');
    }
    const comment = await this.commentRepository.create({
      comment: commentText,
      answer_task: answersTask,
    });
    return await this.commentRepository.save(comment);
  }

  async findAssignment(assignmentId: number) {
    const assignments = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['session', 'session.weeks', 'session.weeks.course'],
    });
    if (!assignments) {
      throw new NotFoundException('Assignment not found');
    }
    return assignments;
  }

  async findAssignmentAnswer(userId: number, assignmentId: number) {
    return await this.assignmentAnswerRepository.find({
      where: { user: { id: userId }, task: { id: assignmentId } },
      relations: ['comment'],
    });
  }

  async findExistingAnswer(userId: number, assignmentId: number) {
    return await this.assignmentAnswerRepository.find({
      where: {
        user: { id: userId },
        task: { id: assignmentId },
        process: Not('rejected'),
      },
    });
  }

  async findAllAssignmentAnswers(assignmentId: number) {
    return await this.assignmentAnswerRepository.find({
      where: { task: { id: assignmentId } },
      relations: ['user', 'comment', 'task'],
    });
  }

  async findOne(id: number) {
    const taskAnswers = await this.assignmentAnswerRepository.findOne({
      where: { id: id },
    });
    if (!taskAnswers) {
      throw new NotFoundException('Assignment answer not found');
    }
    return taskAnswers;
  }

  async update(
    id: number,
    updateAssignmentAnswerDto: UpdateAssignmentAnswersDto,
  ) {
    const taskAnswers = await this.findOne(id);
    if (!taskAnswers) {
      throw new NotFoundException('answer not found');
    }
    if (updateAssignmentAnswerDto.process) {
      taskAnswers.process = updateAssignmentAnswerDto.process;
    }
    if (updateAssignmentAnswerDto.file) {
      taskAnswers.file = updateAssignmentAnswerDto.file;
    }
    return await this.assignmentAnswerRepository.save(taskAnswers);
  }
}
