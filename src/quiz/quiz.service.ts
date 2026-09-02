import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from 'src/entities/quiz.entity';
import { Repository } from 'typeorm';
import { Minggu } from 'src/entities/minggu.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { User } from 'src/entities/user.entity';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { ProgresQuiz } from 'src/entities/progres_quiz.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { JawabanUser } from 'src/entities/jawaban_user.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Minggu)
    private readonly mingguRepository: Repository<Minggu>,
    @InjectRepository(Nilai)
    private readonly nilaiRepository: Repository<Nilai>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pertanyaan)
    private readonly pertanyaanRepository: Repository<Pertanyaan>,
    @InjectRepository(ProgresQuiz)
    private readonly progresQuizRepository: Repository<ProgresQuiz>,
    @InjectRepository(ProgresPertemuan)
    private readonly progresPertemuanRepository: Repository<ProgresPertemuan>,
    @InjectRepository(JawabanUser)
    private readonly jawabanUserRepository: Repository<JawabanUser>,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    const minggu = await this.mingguRepository.findOne({
      where: { id: createQuizDto.mingguId },
      relations: ['pertemuan'],
    });
    if (!minggu) {
      throw new Error('Minggu not found');
    }
    const quiz = await this.quizRepository.create({
      ...createQuizDto,
      minggu: minggu,
    });
    const newQuiz = await this.quizRepository.save(quiz);
    const progres_pertemuan_akhir = await this.progresPertemuanRepository.find({
      where: {
        pertemuan: { akhir: true, minggu: { id: minggu.id } },
        absen: true,
        logbook: true,
      },
      relations: ['user'],
    });

    if (progres_pertemuan_akhir.length > 0) {
      for (const progres of progres_pertemuan_akhir) {
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
            proses: true,
          });
        } else {
          await this.progresQuizRepository.save({
            quiz: newQuiz,
            user: progres.user,
            proses: true,
          });
        }
      }
    }
  }

  async findNilai(quizId: number) {
    const quiz = await this.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    return await this.nilaiRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['user'],
    });
  }

  async findOne(quizId: number) {
    return await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['minggu', 'minggu.kelas'],
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
    if(user.countdownQuiz !== null) {

    const startTime = user.countdownQuiz.getTime();
    const durasi = quiz.durasi * 60000;

    if(startTime + durasi <= Date.now() && user.quizStart === true) {
      return true;
    }else{
      return false;
    }
    }

  }

  async findNilaiUser(userId: number, quziId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return await this.nilaiRepository.find({
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

    if(user.quizStart){
const now = Date.now();
const durationMs = quiz.durasi * 60000;

let startTime = user.countdownQuiz?.getTime();

if (!startTime || now - startTime > durationMs) {
  startTime = now;
  user.countdownQuiz = new Date(startTime);
  await this.userRepository.save(user);
}

const remainingMs = durationMs - (now - startTime);
const remainingSecond = Math.ceil(remainingMs / 1000);
    return remainingSecond;
    }else{

      user.countdownQuiz = new Date();
      user.quizStart = true;

      await this.userRepository.save(user)

      return quiz.durasi * 60;

    }


  }

  async findPertanyaan(quizId: number) {
    return await this.pertanyaanRepository.find({
      where: {
        quiz: { id: quizId },
      },
      relations: {
        jawaban: true,
        quiz: true,
      },
      order: {
        id: 'ASC',
        jawaban: {
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
