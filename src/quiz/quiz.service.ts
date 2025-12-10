import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from 'src/entities/quiz.entity';
import { In, Repository } from 'typeorm';
import { Minggu } from 'src/entities/minggu.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { User } from 'src/entities/user.entity';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { ProgresQuiz } from 'src/entities/progres_quiz.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';

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
    private readonly progresPertemuanRepository: Repository<ProgresPertemuan>
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    const minggu = await this.mingguRepository.findOne({
      where: { id: createQuizDto.mingguId }, relations: ['pertemuan']
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
      where: { pertemuan: { akhir: true, minggu: { id: minggu.id } }, absen: true, logbook: true }, relations: ['user']
    });

    if(progres_pertemuan_akhir.length > 0){
      for (const progres of progres_pertemuan_akhir) {
        await this.progresQuizRepository.save({
          quiz: newQuiz,
          user: progres.user,
          proses: true
        });
      }
    }



}

  findAll() {
    return `This action returns all quiz`;
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
      relations: [
        'minggu',
        'minggu.kelas',
      ],
    });
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

  async findPertanyaan(quizId: number) {
    return await this.pertanyaanRepository.find({
      where: {
        quiz: { id: quizId },
      },
      relations: {
        jawaban: true, // Format baru TypeORM
        quiz: true,
      },
      order: {
        id: 'ASC', // Urutkan pertanyaan
        jawaban: {
          id: 'ASC', // Urutkan jawaban
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
