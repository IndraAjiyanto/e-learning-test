import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { Answer } from 'src/entities/answer.entity';
import { Quiz } from 'src/entities/quiz.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class QuestionsService {
  @InjectRepository(Question)
  private readonly pertanyaanRepository: Repository<Question>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;
  @InjectRepository(Answer)
  private readonly jawabanRepository: Repository<Answer>;
  @InjectRepository(Quiz)
  private readonly quizRepository: Repository<Quiz>;

  async create(createPertanyaanDto: CreateQuestionDto) {
    const quiz = await this.quizRepository.findOne({
      where: { id: createPertanyaanDto.quizId },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    const questions = await this.pertanyaanRepository.create({
      questionText: createPertanyaanDto.questionText,
      image: createPertanyaanDto.image,
      quiz: quiz,
    });
    return await this.pertanyaanRepository.save(questions);
  }

  async findQuestions(quizId: number) {
    return await this.pertanyaanRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['answers.userAnswers'],
    });
  }

  async findOne(questionId: number) {
    const questions = await this.pertanyaanRepository.findOne({
      where: { id: questionId },
      relations: ['answers', 'quiz'],
    });
    if (!questions) {
      throw new NotFoundException('Question not found');
    }
    return questions;
  }

  async update(questionId: number, updatePertanyaanDto: UpdateQuestionDto) {
    const questions = await this.findOne(questionId);
    if (!questions) {
      throw new NotFoundException('Question not found');
    }

    questions.questionText = updatePertanyaanDto.questionText;
    questions.image = updatePertanyaanDto.image;
    await this.pertanyaanRepository.save(questions);

    const jawabanLama = await this.jawabanRepository.find({
      where: { question: { id: questionId } },
    });

    if (!jawabanLama || jawabanLama.length === 0) {
      throw new NotFoundException('Answer not found');
    }

    await this.jawabanRepository.remove(jawabanLama);

    const jawabanBaru = updatePertanyaanDto.answer.map((answers, index) => {
      return this.jawabanRepository.create({
        answer: answers,
        isCorrect: Number(updatePertanyaanDto.answers) === index,
        question: questions,
      });
    });

    return await this.jawabanRepository.save(jawabanBaru);
  }

  async remove(questionId: number) {
    const questions = await this.findOne(questionId);
    const answers = await this.jawabanRepository.find({
      where: { question: { id: questionId } },
    });
    if (!answers) {
      throw new NotFoundException('Answer not found');
    }
    if (!questions) {
      throw new NotFoundException('Question not found');
    }
    await this.jawabanRepository.remove(answers);
    await this.pertanyaanRepository.remove(questions);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
