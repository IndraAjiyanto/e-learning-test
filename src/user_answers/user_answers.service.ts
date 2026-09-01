import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateUserAnswerDto,
  UserAnswerDto,
} from './dto/create-user_answer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAnswer } from 'src/entities/user_answer.entity';
import { In, Repository } from 'typeorm';
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { User } from 'src/entities/user.entity';
import { Score } from 'src/entities/score.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Session } from 'src/entities/session.entity';

@Injectable()
export class UserAnswersService {
  @InjectRepository(UserAnswer)
  private readonly userAnswerRepository: Repository<UserAnswer>;
  @InjectRepository(Question)
  private readonly questionRepository: Repository<Question>;
  @InjectRepository(Answer)
  private readonly answerRepository: Repository<Answer>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Score)
  private readonly scoreRepository: Repository<Score>;
  @InjectRepository(Quiz)
  private readonly quizRepository: Repository<Quiz>;
  @InjectRepository(WeekProgress)
  private readonly weekProgressRepository: Repository<WeekProgress>;
  @InjectRepository(Weeks)
  private readonly weeksRepository: Repository<Weeks>;
  @InjectRepository(UserCourse)
  private readonly userCourseRepository: Repository<UserCourse>;
  @InjectRepository(SessionProgress)
  private readonly sessionProgressRepository: Repository<SessionProgress>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;

  async create(createUserAnswerDto: CreateUserAnswerDto) {
    const answersToInsert: UserAnswer[] = [];

    for (const j of createUserAnswerDto.answerUser) {
      const questions = await this.questionRepository.findOne({
        where: { id: j.questionsId },
      });

      const user = await this.userRepository.findOne({
        where: { id: j.userId },
      });

      if (!questions)
        throw new NotFoundException(`Question id ${j.questionsId} not found`);

      if (!user) throw new NotFoundException(`User id ${j.userId} not found`);

      const answers = j.answersId
        ? await this.answerRepository.findOne({ where: { id: j.answersId } })
        : null;

      const userAnswer = this.userAnswerRepository.create({
        question: questions,
        answer: answers,
        user,
      });

      answersToInsert.push(userAnswer);
    }

    return await this.userAnswerRepository.save(answersToInsert);
  }

  async searchAnswerUser(quizId: string, userId: string) {
    return await this.userAnswerRepository.find({
      where: { question: { quiz: { id: quizId } }, user: { id: userId } },
      relations: ['answer', 'user'],
    });
  }

  async createAnswer(userAnswerDto: UserAnswerDto) {
    const userIsAnswered = await this.userAnswerRepository.findOne({
      where: {
        user: { id: userAnswerDto.userId },
        question: { id: userAnswerDto.questionsId },
      },
    });

    if (userIsAnswered) {
      if (userAnswerDto.answersId !== null) {
        const answers = await this.answerRepository.findOne({
          where: { id: userAnswerDto.answersId },
        });
        userIsAnswered.answer = answers;
        await this.userAnswerRepository.save(userIsAnswered);
      }
    } else {
      const questions = await this.questionRepository.findOne({
        where: { id: userAnswerDto.questionsId },
      });

      if (!questions) {
        throw new NotFoundException('Question not found');
      }

      const user = await this.userRepository.findOne({
        where: { id: userAnswerDto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const answers = userAnswerDto.answersId
        ? await this.answerRepository.findOne({
            where: { id: userAnswerDto.answersId },
          })
        : null;

      const userAnswerEntry = this.userAnswerRepository.create({
        question: questions,
        answer: answers,
        user,
      });

      await this.userAnswerRepository.save(userAnswerEntry);
    }
  }

  async createScore(UserAnswer: UserAnswer[], quizId: string, userId: string) {
    if (UserAnswer.length === 0) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.quizStart = false;
      await this.userRepository.save(user);

      await this.scoreRepository.save({
        user: { id: userId },
        quiz: { id: quizId },
        score: 0,
      });
    } else {
      const answerIds = UserAnswer.map((j) => j.answer?.id).filter(
        (id): id is string => id !== undefined && id !== null,
      );
      const correctAnswers = await this.answerRepository.findBy({
        id: In(answerIds),
      });

      let correctCount = 0;
      correctAnswers.forEach((j) => {
        if (j.isCorrect) {
          correctCount++;
        }
      });

      const questions = await this.questionRepository.find({
        where: { quiz: { id: quizId } },
      });
      const totalQuestions = questions.length;
      const scores = Math.round((correctCount / totalQuestions) * 100);

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }

      const quiz = await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['weeks'],
      });

      if (!quiz) {
        throw new NotFoundException('quiz not found');
      }

      if (scores >= quiz.minScore) {
        await this.weekProgress(quiz.weeks.id, userId);
        await this.updateWeekProgress(quiz.weeks.id, userId);
      }

      user.quizStart = false;
      await this.userRepository.save(user);

      await this.scoreRepository.save({
        user: user,
        quiz: quiz,
        score: scores,
      });
    }
  }

  async updateWeekProgress(weeksId: string, userId: string) {
    const weekProgresses = await this.weekProgressRepository.findOne({
      where: { week: { id: weeksId }, user: { id: userId } },
    });
    if (!weekProgresses) {
      throw new NotFoundException('weekProgresses not found');
    }

    weekProgresses.quiz = true;
    await this.weekProgressRepository.save(weekProgresses);

    return weekProgresses;
  }

  async weekProgress(weeksId: string, userId: string) {
    const currentWeek = await this.weeksRepository.findOne({
      where: { id: weeksId },
      relations: ['course'],
    });
    if (!currentWeek) {
      throw new NotFoundException('Week not found');
    } else if (currentWeek.isFinal === true) {
      const existingUserCourse = await this.userCourseRepository.findOne({
        where: {
          course: { id: currentWeek.course.id },
          user: { id: userId },
        },
      });
      if (existingUserCourse) {
        await this.userCourseRepository.save({
          id: existingUserCourse.id,
          course: { id: currentWeek.course.id },
          user: { id: userId },
          progress: true,
          quiz: true,
        });
      } else {
        await this.userCourseRepository.save({
          course: { id: currentWeek.course.id },
          user: { id: userId },
          progress: true,
          quiz: true,
        });
      }
    } else {
      const weeks = await this.weeksRepository.findOne({
        where: {
          weekNumber: currentWeek.weekNumber + 1,
          course: { id: currentWeek.course.id },
        },
        relations: ['session'],
      });
      if (weeks) {
        if (weeks.session.length > 0) {
          const firstSession = await this.sessionRepository.findOne({
            where: { weeks: { id: weeks.id }, sessionOrder: 1 },
          });
          if (firstSession) {
            const existingSessionProgress =
              await this.sessionProgressRepository.findOne({
                where: {
                  session: { id: firstSession.id },
                  user: { id: userId },
                },
              });
            if (existingSessionProgress) {
              await this.sessionProgressRepository.save({
                id: existingSessionProgress.id,
                user: { id: userId },
                session: firstSession,
                logbook: false,
                isAttended: true,
              });
            } else {
              await this.sessionProgressRepository.save({
                user: { id: userId },
                session: firstSession,
                logbook: false,
                isAttended: true,
              });
            }
          }
        }
        const existingProgress = await this.weekProgressRepository.findOne({
          where: { week: { id: weeks.id }, user: { id: userId } },
        });
        if (existingProgress) {
          await this.weekProgressRepository.update(existingProgress.id, {
            process: true,
          });
        } else {
          await this.weekProgressRepository.save({
            week: weeks,
            user: { id: userId },
            process: true,
            quiz: false,
          });
        }
      }
    }
  }

  async findByUserAndQuestion(userId: string, questionId: string) {
    return await this.userAnswerRepository.find({
      where: { user: { id: userId }, question: { id: questionId } },
      relations: ['answer'],
    });
  }

  async findAnswersByUser(userId: string) {
    return await this.userAnswerRepository.find({
      where: { user: { id: userId } },
      relations: ['answer'],
    });
  }

  async calculateScore(weeksId: string, userId: string) {
    const answers = await this.userAnswerRepository.find({
      where: { question: { quiz: { id: weeksId } }, user: { id: userId } },
      relations: ['answer'],
    });

    const totalQuestions = answers.length;
    const scorePerQuestion = 100 / totalQuestions;

    const totalScore = answers.reduce((sum, j) => {
      if (j.answer !== null && j.answer.isCorrect) {
        return sum + scorePerQuestion;
      }
      return sum;
    }, 0);

    return totalScore;
  }

  async deleteAnswerUser(userId: string, quizId: string) {
    const questions = await this.questionRepository.find({
      where: { quiz: { id: quizId } },
      select: ['id'],
    });

    const ids = questions.map((p) => p.id);

    await this.userAnswerRepository.delete({
      user: { id: userId },
      question: { id: In(ids) },
    });
  }
}
