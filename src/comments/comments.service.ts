import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/entities/comment.entity';
import { Repository } from 'typeorm';
import { AnswerTask, ProcessType } from 'src/entities/answer_task.entity';

@Injectable()
export class CommentsService {
  @InjectRepository(Comment)
  private readonly commentRepository: Repository<Comment>;
  @InjectRepository(AnswerTask)
  private readonly jawabanTugasRepository: Repository<AnswerTask>;

  async create(createKomentarDto: CreateCommentsDto) {
    const taskAnswers = await this.jawabanTugasRepository.findOne({
      where: { id: createKomentarDto.answerTaskId },
    });
    if (!taskAnswers) {
      throw new NotFoundException('User tidak ada');
    }
    const comment = await this.commentRepository.create({
      ...createKomentarDto,
      answer_task: taskAnswers,
    });
    return await this.commentRepository.save(comment);
  }

  async updateJawabanTugas(assignment_answerId: number, proses: ProcessType) {
    const taskAnswers = await this.jawabanTugasRepository.findOne({
      where: { id: assignment_answerId },
    });

    if (!taskAnswers) {
      throw new NotFoundException('Jawaban Tugas tidak ada');
    }

    taskAnswers.process = proses;
    return await this.jawabanTugasRepository.save(taskAnswers);
  }
}
