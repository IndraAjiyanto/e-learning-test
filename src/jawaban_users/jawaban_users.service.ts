import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJawabanUserDto } from './dto/create-jawaban_user.dto';
import { UpdateJawabanUserDto } from './dto/update-jawaban_user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JawabanUser } from 'src/entities/jawaban_user.entity';
import { DeepPartial, In, Repository } from 'typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Jawaban } from 'src/entities/jawaban.entity';
import { User } from 'src/entities/user.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { Quiz } from 'src/entities/quiz.entity';

@Injectable()
export class JawabanUsersService {
    @InjectRepository(JawabanUser)
    private readonly jawabanUserRepository: Repository<JawabanUser>
    @InjectRepository(Pertanyaan)
    private readonly pertanyaanRepository: Repository<Pertanyaan>
    @InjectRepository(Jawaban)
    private readonly jawabanRepository: Repository<Jawaban>
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
    @InjectRepository(Nilai)
    private readonly nilaiRepository: Repository<Nilai>
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>

  
async create(createJawabanUserDto: CreateJawabanUserDto) {
  const jawabanToInsert: JawabanUser[] = [];

  for (const j of createJawabanUserDto.jawabanUser) {
    const pertanyaan = await this.pertanyaanRepository.findOne({ where: { id: j.pertanyaanId } });
    const jawaban = await this.jawabanRepository.findOne({ where: { id: j.jawabanId } });
    const user = await this.userRepository.findOne({ where: { id: j.userId } });

    if (!pertanyaan) throw new NotFoundException(`Pertanyaan id ${j.pertanyaanId} tidak ditemukan`);
    if (!jawaban) throw new NotFoundException(`Jawaban id ${j.jawabanId} tidak ditemukan`);
    if (!user) throw new NotFoundException(`User id ${j.userId} tidak ditemukan`);

    const jawabanUser = this.jawabanUserRepository.create({
      pertanyaan,
      jawaban,
      user
    });

    jawabanToInsert.push(jawabanUser);
  }

  return this.jawabanUserRepository.save(jawabanToInsert);
}

async nilaiCreate(createJawabanUserDto: CreateJawabanUserDto) {
  // ambil array jawabanUser
  const jawabanUser = createJawabanUserDto.jawabanUser;

  // 1. Ambil semua id jawaban yg dipilih user
  const jawabanIds = jawabanUser.map(j => j.jawabanId);

  // 2. Ambil data jawaban dari DB, beserta apakah benar/salah
  const jawabanBenar = await this.jawabanRepository.findBy({
    id: In(jawabanIds),
  });

  // 3. Hitung jumlah benar
  let benar = 0;
  jawabanBenar.forEach(j => {
    if (j.jawaban_benar) {
      benar++;
    }
  });

  // 4. Hitung nilai
  const totalSoal = jawabanUser.length;
  const nilai = Math.round((benar / totalSoal) * 100);

  // 5. Simpan ke tabel nilai / riwayat
  const userId = jawabanUser[0].userId;
  const user = await this.userRepository.findOne({where: {id: userId}})
  if(!user){
    throw new NotFoundException('user not found')
  }

  // ambil quizId dari pertanyaan pertama
  const quizId = await this.pertanyaanRepository.findOne({
    where: { id: jawabanUser[0].pertanyaanId },
    relations: ['quiz'],
  }).then(p => p?.quiz.id);

  const quiz = await this.quizRepository.findOne({where: {id: quizId}})
  if(!quiz){
    throw new NotFoundException('quiz not found')
  }

  await this.nilaiRepository.save({
    user: user,
    quiz: quiz,
    nilai
  });

}



async findByUserAndPertanyaan(userId: number, pertanyaanId: number) {
  return await this.jawabanUserRepository.find({ 
    where: { user: {id : userId}, pertanyaan: {id: pertanyaanId} }, relations: ['jawaban'] 
  });
}

async findJawabanByUser(userId: number){
  return await this.jawabanUserRepository.find({where: {user : {id: userId} }, relations: ['jawaban']})
}

async AmountNilai(mingguId: number, userId: number){
  const jawaban = await this.jawabanUserRepository.find({where: {pertanyaan: {quiz: {id: mingguId}}, user: {id: userId}}, relations: ['jawaban']})
  
const jumlahSoal = jawaban.length; 
const nilaiPerSoal = 100 / jumlahSoal;

const totalNilai = jawaban.reduce((sum, j) => {     
  if (j.jawaban.jawaban_benar) {       
    return sum + nilaiPerSoal;     
  }     
  return sum;   
}, 0);


  return totalNilai;
}

  findAll() {
    return `This action returns all jawabanUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jawabanUser`;
  }

  update(id: number, updateJawabanUserDto: UpdateJawabanUserDto) {
    return `This action updates a #${id} jawabanUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} jawabanUser`;
  }
}
