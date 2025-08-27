import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Absen } from 'src/entities/absen.entity';
import { Kategori } from 'src/entities/kategori.entity';

@Injectable()
export class KelassService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>, 
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Pertemuan)
        private readonly pertemuanRepository: Repository<Pertemuan>,
        @InjectRepository(Absen)
        private readonly absenRepository: Repository<Absen>,
        @InjectRepository(Kategori)
        private readonly kategoriRepository: Repository<Kategori>
  ){}

  async create(createKelassDto: CreateKelassDto) {
    const kategori = await this.kategoriRepository.findOne({where: {id: createKelassDto.kategoriId}})
    if(!kategori){
      throw new NotFoundException('kategori ini tidak ada')
    }
    const kelas = await this.kelasRepository.create({
      ...createKelassDto,
      kategori: kategori,
    })
    return await this.kelasRepository.save(kelas)
  }

  async addUserToKelas(userId: number, kelasId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['kelas'],
    });
  
    if (!user) {
      throw new NotFoundException('User tidak ada');
    }
  
    const kelas = await this.kelasRepository.findOneBy({ id: kelasId });
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ada');
    }
  
    const sudahGabung = user.kelas.some((k) => k.id === kelas.id);
    if (sudahGabung) {
      throw new BadRequestException('User sudah tergabung dalam kelas');
    }
  
    user.kelas.push(kelas);
    return await this.userRepository.save(user);
  }

async findMyCourse(userId: number) {
  const user = await this.userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  return await this.kelasRepository.find({
    where: {
      user: { id: userId }  
    },
    relations: ['user', 'kategori'], 
  });
}

async findPertemuan(kelasId: number){
    const kelas = await this.findOne(kelasId);
  if (!kelas) {
    throw new NotFoundException(`User with ID ${kelasId} not found`);
  }
  return await this.pertemuanRepository.find({
    where: {
      kelas: { id: kelasId }
    },
    relations: ['kelas', 'absen.user'], 
  });
}

async findUser(){
  return await this.userRepository.find({where: {role: 'user'}})
}

async findKategori(){
  return await this.kategoriRepository.find()
}


  async findAll() {
    return await this.kelasRepository.find({relations: ['kategori']})
  }

  async findMurid(id: number){
    return await this.userRepository.find({where: {kelas: {id: id}}})
  }

  async allKelas(){
   return await this.kelasRepository.find({relations: ['user', 'kategori']})
  }

  async findOne(id: number) {
    const kelas =  this.kelasRepository.findOne({where: {id}, relations: ['user', 'kategori']})
    if(!kelas){
      throw new NotFoundException()
    }
    return kelas
  }

  async update(id: number, updateKelassDto: UpdateKelassDto) {
    const kelas = await this.findOne(id)
    if(!kelas){
      throw new NotFoundException()
    }
    Object.assign(kelas, updateKelassDto)
    return await this.kelasRepository.save(kelas)
  }

  async remove(id: number) {
    const kelas = await this.findOne(id)
    if(!kelas){
      throw new NotFoundException()
    }
    return await this.kelasRepository.remove(kelas)
  }

async removeUserKelas(userId: number, kelasId: number) {

await this.kelasRepository  
    .createQueryBuilder()
  .relation(Kelas, "user")
  .of(kelasId)
  .remove(userId);
}



}
