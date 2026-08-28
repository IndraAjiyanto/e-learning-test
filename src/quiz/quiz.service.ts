import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from 'src/entities/quiz.entity';
import { Repository } from 'typeorm';
import { Weeks } from 'src/entities/weeks.entity';
import { Score } from 'src/entities/score.entity';
import { User } from 'src/entities/user.entity';
import { Question } from 'src/entities/question.entity';
import { QuizProgress } from 'src/entities/quiz_progress.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { UserAnswer } from 'src/entities/user_answer.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Weeks)
    private readonly weeksRepository: Repository<Weeks>,
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(QuizProgress)
    private readonly progresQuizRepository: Repository<QuizProgress>,
    @InjectRepository(SessionProgress)
    private readonly sessionProgressRepository: Repository<SessionProgress>,
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepository: Repository<UserAnswer>,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    const weeks = await this.weeksRepository.findOne({
      where: { id: createQuizDto.weeksId },
      relations: ['session'],
    });
    if (!weeks) {
      throw new Error('Weeks not found');
    }
    const quiz = await this.quizRepository.create({
      ...createQuizDto,
      weeks: weeks,
    });
    const newQuiz = await this.quizRepository.save(quiz);
    const lastSessionProgress = await this.sessionProgressRepository.find({
      where: {
        session: { isFinal: true, weeks: { id: weeks.id } },
        isAttended: true,
        logbook: true,
      },
      relations: ['user'],
    });

    if (lastSessionProgress.length > 0) {
      for (const progres of lastSessionProgress) {
        const existingProgresQuiz = await this.progresQuizRepository.findOne({
          where: {
            quiz: { id: newQuiz.id },
            user: { id: progres.user.id },
          },
        });
        if (existingProgresQuiz) {
          await this.progresQuizRepository.save({
            id: existingProgresQuiz.id,
            quiz: newQuiz,
            user: progres.user,
            process: true,
          });
        } else {
          await this.progresQuizRepository.save({
            quiz: newQuiz,
            user: progres.user,
            process: true,
          });
        }
      }
    }
  }

  async findScore(quizId: number) {
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    return await this.scoreRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['user'],
    });
  }

  async findOne(quizId: number) {
    return await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['weeks', 'weeks.course'],
    });
  }

  async checkStartQuestion(userId: number, quizId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    if (user.countdownQuiz !== null) {
      const startTime = user.countdownQuiz.getTime();
      const duration = quiz.duration * 60000;

      if (startTime + duration <= Date.now() && user.quizStart === true) {
        return true;
      } else {
        return false;
      }
    }
  }

  async findUserScore(userId: number, quziId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return await this.scoreRepository.find({
      where: { user: { id: userId }, quiz: { id: quziId } },
    });
  }

  async getRemainingTime(userId: number, quizId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }

    if (user.quizStart) {
      const now = Date.now();
      const durationMs = quiz.duration * 60000;

      let startTime = user.countdownQuiz?.getTime();

      if (!startTime || now - startTime > durationMs) {
        startTime = now;
        user.countdownQuiz = new Date(startTime);
        await this.userRepository.save(user);
      }

      const remainingMs = durationMs - (now - startTime);
      const remainingSecond = Math.ceil(remainingMs / 1000);
      return remainingSecond;
    } else {
      user.countdownQuiz = new Date();
      user.quizStart = true;

      await this.userRepository.save(user);

      return quiz.duration * 60;
    }
  }

  async findQuestions(quizId: number) {
    return await this.questionRepository.find({
      where: {
        quiz: { id: quizId },
      },
      relations: {
        answers: true,
        quiz: true,
      },
      order: {
        id: 'ASC',
        answers: {
          id: 'ASC',
        },
      },
    });
  }

  async update(quizId: number, updateQuizDto: UpdateQuizDto) {
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }

    Object.assign(quiz, updateQuizDto);
    return await this.quizRepository.save(quiz);
  }

  async remove(quizId: number) {
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    await this.quizRepository.remove(quiz);
  }
}
