import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class KelassService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>, 
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
  ){}

  async create(createKelassDto: CreateKelassDto) {
    const kelas = await this.kelasRepository.create(createKelassDto)
    return await this.kelasRepository.save(kelas)
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
    relations: ['user'], 
  });
}

  async findAll() {
    return await this.kelasRepository.find()
  }

  async findOne(id: number) {
    return await this.kelasRepository.findOne({where: {id}})
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
}
