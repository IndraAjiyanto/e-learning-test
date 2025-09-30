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
  ){}

  async create(createQuizDto: CreateQuizDto) {
    const minggu = await this.mingguRepository.findOne({where: {id: createQuizDto.mingguId}});
    if(!minggu){
      throw new Error('Minggu not found');
    }
    const quiz = await this.quizRepository.create({
      ...createQuizDto,
      minggu: minggu, 
    });
    return await this.quizRepository.save(quiz);
  }

  findAll() {
    return `This action returns all quiz`;
  }

  async findOne(quizId: number) {
    return await this.quizRepository.findOne({where: {id: quizId}, relations: ['minggu', 'minggu.kelas', 'pertanyaan', 'pertanyaan.jawaban', 'nilai', 'nilai.user']});
  }

  async findNilaiUser(userId:number, quziId:number){
    const user = await this.userRepository.findOne({where: {id: userId}})
    if(!user){
      throw new NotFoundException('user not found');
    }
    return await this.nilaiRepository.find({where: {user: {id: userId}, quiz: {id: quziId}}})

  }


  async findPertanyaan(quizId:number){
    return this.pertanyaanRepository.find({where: {quiz: {id:quizId}}, relations:['jawaban']})
  }

  async update(quizId: number, updateQuizDto: UpdateQuizDto) {
        const quiz = await this.findOne(quizId)
    if(!quiz){
      throw new NotFoundException('quiz not found');
    }

    Object.assign(quiz, updateQuizDto)
    return await this.mingguRepository.save(quiz)
  }

  async remove(quizId: number) {
            const quiz = await this.findOne(quizId)
    if(!quiz){
      throw new NotFoundException('quiz not found')
    }
    await this.quizRepository.remove(quiz)
  }
}
