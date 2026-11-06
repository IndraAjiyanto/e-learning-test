import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from 'src/entities/quiz.entity';
import { Repository, In } from 'typeorm';
import { Weeks } from 'src/entities/weeks.entity';
import { Score } from 'src/entities/score.entity';
import { User } from 'src/entities/user.entity';
import { Answer } from 'src/entities/answer.entity';
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
    const quiz = this.quizRepository.create({
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

  async findScore(quizId: string) {
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    return await this.scoreRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['user'],
    });
  }

  async findOne(quizId: string) {
    return await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['weeks', 'weeks.course', 'syllabus', 'syllabus.course'],
    });
  }

  async resetQuizState(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;
    if (user.quizStart || user.countdownQuiz) {
      user.quizStart = false;
      user.countdownQuiz = null;
      await this.userRepository.save(user);
    }
  }

  async clearUserAnswers(userId: string, quizId: string): Promise<void> {
    const questions = await this.questionRepository.find({
      where: { quiz: { id: quizId } },
      select: ['id'],
    });
    const ids = questions.map((q) => q.id);
    if (ids.length > 0) {
      await this.userAnswerRepository.delete({
        user: { id: userId },
        question: { id: In(ids) },
      });
    }
  }

  async checkStartQuestion(userId: string, quizId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }

    if (user.countdownQuiz !== null && user.quizStart === true) {
      const startTime = user.countdownQuiz.getTime();
      const durationMs = (quiz.duration || 1) * 60000;
      const now = Date.now();
      const elapsed = now - startTime;

      // Jika waktu sudah lewat jauh melebihi durasi kuis (misal kuis ditinggalkan berjam-jam/berhari-hari),
      // ini adalah stale session (sesi kadaluwarsa yang ditinggalkan), BUKAN timeout saat kuis aktif.
      // Reset state kuis otomatis agar pengguna tidak terjebak timeout palsu dan tidak otomatis ter-submit 0.
      const gracePeriodMs = Math.max(durationMs, 5 * 60000);
      if (elapsed > durationMs + gracePeriodMs) {
        user.quizStart = false;
        user.countdownQuiz = null;
        await this.userRepository.save(user);
        return false;
      }

      if (elapsed >= durationMs) {
        return true;
      }
    }
    return false;
  }

  async findUserScore(userId: string, quziId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return await this.scoreRepository.find({
      where: { user: { id: userId }, quiz: { id: quziId } },
    });
  }

  async isQuizPassed(userId: string, quizId: string): Promise<boolean> {
    const quiz = await this.findOne(quizId);
    if (!quiz) return false;
    const scores = await this.findUserScore(userId, quizId);
    const minScore = quiz.minScore ?? 0;
    return scores.some((s) => s.score >= minScore);
  }

  async getRemainingTime(userId: string, quizId: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }

    const durationMs = (quiz.duration || 1) * 60000;
    const now = Date.now();

    if (user.quizStart && user.countdownQuiz) {
      let startTime = user.countdownQuiz.getTime();

      // Jika waktu sudah lewat dari durasi kuis, reset menjadi sesi baru dengan waktu penuh
      if (now - startTime > durationMs) {
        startTime = now;
        user.countdownQuiz = new Date(startTime);
        await this.userRepository.save(user);
        await this.clearUserAnswers(userId, quizId);
        return (quiz.duration || 1) * 60;
      }

      const remainingMs = durationMs - (now - startTime);
      return Math.max(0, Math.ceil(remainingMs / 1000));
    } else {
      user.countdownQuiz = new Date(now);
      user.quizStart = true;

      await this.userRepository.save(user);
      await this.clearUserAnswers(userId, quizId);

      return (quiz.duration || 1) * 60;
    }
  }

  async findQuestions(quizId: string) {
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

  async update(quizId: string, updateQuizDto: UpdateQuizDto) {
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }

    Object.assign(quiz, updateQuizDto);
    return await this.quizRepository.save(quiz);
  }

  /**
   * Apakah sudah ada user yang mengerjakan quiz ini. Begitu ada satu skor,
   * soal dan pengaturan quiz dikunci - mengubahnya akan membuat hasil yang
   * sudah tercatat tidak lagi cocok dengan soalnya.
   */
  async hasAttempts(quizId: string): Promise<boolean> {
    if (!quizId) return false;
    const count = await this.scoreRepository.count({
      where: { quiz: { id: quizId } },
    });
    return count > 0;
  }

  async isQuizUnlocked(userId: string, quizId: string): Promise<boolean> {
    const quizProgress = await this.progresQuizRepository.findOne({
      where: {
        quiz: { id: quizId },
        user: { id: userId },
        process: true,
      },
    });
    return !!quizProgress;
  }

  async remove(quizId: string) {
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }

    if (await this.hasAttempts(quizId)) {
      throw new ForbiddenException(
        'Quiz cannot be deleted because it has already been attempted by a user',
      );
    }
    // Hapus manual berurutan dalam transaksi: FK di DB tidak punya
    // ON DELETE CASCADE (skema lama, synchronize:false), dan
    // repository.remove() hanya cascade ke relasi yang ter-load.
    // Tanpa ini, hapus quiz yang sudah ada questions/scores-nya -> 500.
    await this.quizRepository.manager.transaction(async (em) => {
      const questions = await em.find(Question, {
        where: { quiz: { id: quizId } },
        select: ['id'],
      });
      const questionIds = questions.map((q) => q.id);
      if (questionIds.length > 0) {
        await em.delete(UserAnswer, {
          question: { id: In(questionIds) },
        });
        await em.delete(Answer, { question: { id: In(questionIds) } });
        await em.delete(Question, { id: In(questionIds) });
      }
      await em.delete(Score, { quiz: { id: quizId } });
      await em.delete(QuizProgress, { quiz: { id: quizId } });
      await em.delete(Quiz, { id: quizId });
    });
  }
}
