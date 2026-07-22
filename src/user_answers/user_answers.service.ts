import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserAnswerDto, UserAnswerDto } from './dto/create-user_answer.dto';
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
  private readonly jawabanUserRepository: Repository<UserAnswer>;
  @InjectRepository(Question)
  private readonly pertanyaanRepository: Repository<Question>;
  @InjectRepository(Answer)
  private readonly jawabanRepository: Repository<Answer>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Score)
  private readonly nilaiRepository: Repository<Score>;
  @InjectRepository(Quiz)
  private readonly quizRepository: Repository<Quiz>;
  @InjectRepository(WeekProgress)
  private readonly weekProgressRepository: Repository<WeekProgress>;
  @InjectRepository(Weeks)
  private readonly mingguRepository: Repository<Weeks>;
  @InjectRepository(UserCourse)
  private readonly userKelasRepository: Repository<UserCourse>;
  @InjectRepository(SessionProgress)
  private readonly progresPertemuanRepository: Repository<SessionProgress>;
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;

  async create(createUserAnswerDto: CreateUserAnswerDto) {
    const jawabanToInsert: UserAnswer[] = [];

    for (const j of createUserAnswerDto.answerUser) {
      const questions = await this.pertanyaanRepository.findOne({
        where: { id: j.questionsId },
      });

      const user = await this.userRepository.findOne({
        where: { id: j.userId },
      });

      if (!questions)
        throw new NotFoundException(
          `Pertanyaan id ${j.questionsId} tidak ditemukan`,
        );

      if (!user)
        throw new NotFoundException(`User id ${j.userId} tidak ditemukan`);

      const answers = j.answersId
        ? await this.jawabanRepository.findOne({ where: { id: j.answersId } })
        : null;

      const jawabanUser = this.jawabanUserRepository.create({
        question: questions,
        answer: answers,
        user,
      });

      jawabanToInsert.push(jawabanUser);
    }

    return await this.jawabanUserRepository.save(jawabanToInsert);
  }

  async searchAnswerUser(quizId: number, userId: number) {
    return await this.jawabanUserRepository.find({
      where: { question: { quiz: { id: quizId } }, user: { id: userId } },
      relations: ['answers','user'],
    });
  }


  async createAnswer(jawabanUserDto: UserAnswerDto) {
    const userIsAnswered = await this.jawabanUserRepository.findOne({
      where: {
        user: { id: jawabanUserDto.userId },
        question: { id: jawabanUserDto.questionsId },
      },
    });

    if (userIsAnswered) {
      if(jawabanUserDto.answersId !== null) {
      const answers = await this.jawabanRepository.findOne({ where: { id: jawabanUserDto.answersId } });
      userIsAnswered.answer = answers
      await this.jawabanUserRepository.save(userIsAnswered);
      }

    } else {
      const questions = await this.pertanyaanRepository.findOne({
        where: { id: jawabanUserDto.questionsId },
      });

      if (!questions) {
  throw new NotFoundException('Question not found');
}

      const user = await this.userRepository.findOne({
        where: { id: jawabanUserDto.userId },
      });

if (!user) {
  throw new NotFoundException('User not found');
}
      const answers = jawabanUserDto.answersId
        ? await this.jawabanRepository.findOne({ where: { id: jawabanUserDto.answersId } })
        : null;

      const jawabanUser = this.jawabanUserRepository.create({
        question: questions,
        answer: answers,
        user,
      });

      await this.jawabanUserRepository.save(jawabanUser);
    }

  }

  async nilaiCreate(JawabanUser: UserAnswer[], quizId: number, userId: number) {
    if(JawabanUser.length === 0) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
          user.quizStart = false;
    await this.userRepository.save(user);

      await this.nilaiRepository.save({
        user: { id: userId },
        quiz: { id: quizId },
        scores: 0,
      });
    }else{

    const jawabanIds = JawabanUser.map((j) => j.answer?.id).filter((id): id is number => id !== undefined && id !== null);
    const jawabanBenar = await this.jawabanRepository.findBy({
      id: In(jawabanIds),
    });


    let benar = 0;
    jawabanBenar.forEach((j) => {
      if (j.isCorrect) {
        benar++;
      }
    });

    const questions = await this.pertanyaanRepository.find({where: { quiz: { id: quizId } }});
    const totalSoal = questions.length;
    const scores = Math.round((benar / totalSoal) * 100);

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

    await this.nilaiRepository.save({
      user: user,
      quiz: quiz,
      scores,
    });
    }

  }

  async updateWeekProgress(weeksId: number, userId: number) {
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

  async weekProgress(weeksId: number, userId: number) {
    const minggu_sebelum = await this.mingguRepository.findOne({
      where: { id: weeksId },
      relations: ['course'],
    });
    if (!minggu_sebelum) {
      throw new NotFoundException('minggu_sebelum not found');
    } else if (minggu_sebelum.isFinal === true) {
      const existingUserKelas = await this.userKelasRepository.findOne({
        where: { course: { id: minggu_sebelum.course.id }, user: { id: userId } },
      });
      if (existingUserKelas) {
        await this.userKelasRepository.save({
          id: existingUserKelas.id,
          course: { id: minggu_sebelum.course.id },
          user: { id: userId },
          progres: true,
          quiz: true,
        });
      } else {
        await this.userKelasRepository.save({
          course: { id: minggu_sebelum.course.id },
          user: { id: userId },
          progres: true,
          quiz: true,
        });
      }
    } else {
      const weeks = await this.mingguRepository.findOne({
        where: {
          weekNumber: minggu_sebelum.weekNumber + 1,
          course: { id: minggu_sebelum.course.id },
        },
        relations: ['session'],
      });
      if (weeks) {
        if (weeks.session.length > 0) {
          const session_satu = await this.sessionRepository.findOne({
            where: { weeks: { id: weeks.id }, sessionOrder: 1 },
          });
          if (session_satu) {
            const existingProgresPertemuan =
              await this.progresPertemuanRepository.findOne({
                where: {
                  session: { id: session_satu.id },
                  user: { id: userId },
                },
              });
            if (existingProgresPertemuan) {
              await this.progresPertemuanRepository.save({
                id: existingProgresPertemuan.id,
                user: { id: userId },
                session: session_satu,
                logbook: false,
                attendances: true,
              });
            } else {
              await this.progresPertemuanRepository.save({
                user: { id: userId },
                session: session_satu,
                logbook: false,
                attendances: true,
              });
            }
          }
        }
        const existingProgres = await this.weekProgressRepository.findOne({
          where: { week: { id: weeks.id }, user: { id: userId } },
        });
        if (existingProgres) {
          await this.weekProgressRepository.update(existingProgres.id, {
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

  async findByUserAndQuestion(userId: number, questionId: number) {
    return await this.jawabanUserRepository.find({
      where: { user: { id: userId }, question: { id: questionId } },
      relations: ['answers'],
    });
  }

  async findAnswersByUser(userId: number) {
    return await this.jawabanUserRepository.find({
      where: { user: { id: userId } },
      relations: ['answers'],
    });
  }

  async AmountNilai(weeksId: number, userId: number) {
    const answers = await this.jawabanUserRepository.find({
      where: { question: { quiz: { id: weeksId } }, user: { id: userId } },
      relations: ['answers'],
    });

    const jumlahSoal = answers.length;
    const nilaiPerSoal = 100 / jumlahSoal;

    const totalNilai = answers.reduce((sum, j) => {
      if (j.answer !== null && j.answer.isCorrect) {
        return sum + nilaiPerSoal;
      }
      return sum;
    }, 0);

    return totalNilai;
  }

  async deleteAnswerUser(userId:number, quizId:number){
const questions = await this.pertanyaanRepository.find({
  where: { quiz: { id: quizId } },
  select: ["id"]
});

const ids = questions.map(p => p.id);

await this.jawabanUserRepository.delete({
  user: { id: userId },
  question: { id: In(ids) }
});

  }
}
