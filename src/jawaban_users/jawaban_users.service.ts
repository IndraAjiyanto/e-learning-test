import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJawabanUserDto } from './dto/create-jawaban_user.dto';
import { UpdateJawabanUserDto } from './dto/update-jawaban_user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JawabanUser } from 'src/entities/jawaban_user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Jawaban } from 'src/entities/jawaban.entity';
import { User } from 'src/entities/user.entity';

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

  
async create(createJawabanUserDto: CreateJawabanUserDto) {
  const jawabanToInsert: JawabanUser[] = [];

  for (const j of createJawabanUserDto.jawabanUser) {
    const pertanyaan = await this.pertanyaanRepository.findOne({ where: { id: j.pertanyaanId } });
    const jawaban = await this.jawabanRepository.findOne({ where: { id: j.jawabanId } });
    const user = await this.userRepository.findOne({ where: { id: j.userId } });

    if (!pertanyaan) throw new NotFoundException(`Pertanyaan id ${j.pertanyaanId} tidak ditemukan`);
    if (!jawaban) throw new NotFoundException(`Jawaban id ${j.jawabanId} tidak ditemukan`);
    if (!user) throw new NotFoundException(`User id ${j.userId} tidak ditemukan`);

    const existing = await this.jawabanUserRepository.findOne({
      where: {
        pertanyaan: { id: j.pertanyaanId },
        user: { id: j.userId }
      },
      relations: ['pertanyaan', 'user']
    });

    if (existing) {
      throw new Error(`User id ${j.userId} sudah menjawab pertanyaan id ${j.pertanyaanId}`);
    }

    const jawabanUser = this.jawabanUserRepository.create({
      pertanyaan,
      jawaban,
      user
    });

    jawabanToInsert.push(jawabanUser);
  }

  return this.jawabanUserRepository.save(jawabanToInsert);
}


async findByUserAndPertanyaan(userId: number, pertanyaanId: number) {
  return await this.jawabanUserRepository.find({ 
    where: { user: {id : userId}, pertanyaan: {id: pertanyaanId} }, relations: ['jawaban'] 
  });
}

async findJawabanByUser(userId: number){
  return await this.jawabanUserRepository.find({where: {user : {id: userId} }, relations: ['jawaban']})
}

async AmountNilai(pertemuanId: number, userId: number){
  const jawaban = await this.jawabanUserRepository.find({where: {pertanyaan: {pertemuan: {id: pertemuanId}}, user: {id: userId}}, relations: ['jawaban']})

  
  const totalNilai = jawaban.reduce((sum, j) => {
    if (j.jawaban.jawaban_benar) {
      return sum + 10;
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
