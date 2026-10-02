import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/entities/comment.entity';
import { Repository } from 'typeorm';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { ProcessStatus } from 'src/entities/types/process-status';

@Injectable()
export class CommentsService {
  @InjectRepository(Comment)
  private readonly commentRepository: Repository<Comment>;
  @InjectRepository(AnswerTask)
  private readonly assignmentAnswerRepository: Repository<AnswerTask>;

  async create(createCommentDto: CreateCommentsDto) {
    const taskAnswers = await this.assignmentAnswerRepository.findOne({
      where: { id: createCommentDto.answerTaskId },
    });
    if (!taskAnswers) {
      throw new NotFoundException('User not found');
    }
    const comment = await this.commentRepository.create({
      ...createCommentDto,
      answer_task: taskAnswers,
    });
    return await this.commentRepository.save(comment);
  }

  async updateAssignmentAnswer(
    assignment_answerId: string,
    process: ProcessStatus,
  ) {
    const taskAnswers = await this.assignmentAnswerRepository.findOne({
      where: { id: assignment_answerId },
    });

    if (!taskAnswers) {
      throw new NotFoundException('Assignment answer not found');
    }

    taskAnswers.process = process;
    return await this.assignmentAnswerRepository.save(taskAnswers);
  }
}
