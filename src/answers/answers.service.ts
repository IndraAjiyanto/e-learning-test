import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/entities/answer.entity';
import { Repository } from 'typeorm';
import { Question } from 'src/entities/question.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}
  async create(createAnswerDto: CreateAnswerDto) {
    const questions = await this.questionRepository.findOne({
      where: { id: createAnswerDto.questionsId },
    });
    if (!questions) {
      throw new NotFoundException('Session not found');
    }

    const answers = this.answerRepository.create({
      answer: createAnswerDto.answer,
      isCorrect: createAnswerDto.is_correct,
      question: questions,
    });
    return await this.answerRepository.save(answers);
  }

  async findCorrectAnswer(questionId: number) {
    return await this.answerRepository.find({
      where: { question: { id: questionId } },
    });
  }
}
