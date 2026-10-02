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
  private readonly questionRepository: Repository<Question>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;
  @InjectRepository(Answer)
  private readonly answerRepository: Repository<Answer>;
  @InjectRepository(Quiz)
  private readonly quizRepository: Repository<Quiz>;

  async create(createQuestionDto: CreateQuestionDto) {
    const quiz = await this.quizRepository.findOne({
      where: { id: createQuestionDto.quizId },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    const questions = await this.questionRepository.create({
      questionText: createQuestionDto.questionText,
      image: createQuestionDto.image,
      quiz: quiz,
    });
    return await this.questionRepository.save(questions);
  }

  async findQuestions(quizId: string) {
    return await this.questionRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['answers.userAnswers'],
    });
  }

  async findOne(questionId: string) {
    const questions = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['answers', 'quiz'],
    });
    if (!questions) {
      throw new NotFoundException('Question not found');
    }
    return questions;
  }

  async update(questionId: string, updateQuestionDto: UpdateQuestionDto) {
    const questions = await this.findOne(questionId);
    if (!questions) {
      throw new NotFoundException('Question not found');
    }

    questions.questionText = updateQuestionDto.questionText;
    questions.image = updateQuestionDto.image;
    await this.questionRepository.save(questions);

    const oldAnswers = await this.answerRepository.find({
      where: { question: { id: questionId } },
    });

    if (!oldAnswers || oldAnswers.length === 0) {
      throw new NotFoundException('Answer not found');
    }

    await this.answerRepository.remove(oldAnswers);

    const newAnswers = updateQuestionDto.answer.map((answers, index) => {
      return this.answerRepository.create({
        answer: answers,
        isCorrect: Number(updateQuestionDto.answers) === index,
        question: questions,
      });
    });

    return await this.answerRepository.save(newAnswers);
  }

  async remove(questionId: string) {
    const questions = await this.findOne(questionId);
    const answers = await this.answerRepository.find({
      where: { question: { id: questionId } },
    });
    if (!answers) {
      throw new NotFoundException('Answer not found');
    }
    if (!questions) {
      throw new NotFoundException('Question not found');
    }
    await this.answerRepository.remove(answers);
    await this.questionRepository.remove(questions);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
