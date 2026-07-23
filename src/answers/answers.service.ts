import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJawabanDto } from './dto/create-jawaban.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/entities/answer.entity';
import { Repository } from 'typeorm';
import { Question } from 'src/entities/question.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly jawabanRepository: Repository<Answer>,
    @InjectRepository(Question)
    private readonly pertanyaanRepository: Repository<Question>,
  ) {}
  async create(createJawabanDto: CreateJawabanDto) {
    const questions = await this.pertanyaanRepository.findOne({
      where: { id: createJawabanDto.questionsId },
    });
    if (!questions) {
      throw new NotFoundException('session ini tidak ada');
    }

    const answers = this.jawabanRepository.create({
      ...createJawabanDto,
      question: questions,
    });
    return await this.jawabanRepository.save(answers);
  }

  async findJawabanBenar(questionId: number) {
    return await this.jawabanRepository.find({
      where: { question: { id: questionId } },
    });
  }
}
