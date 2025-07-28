import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { UpdateAbsenDto } from './dto/update-absen.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Absen } from 'src/entities/absen.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AbsensService {
  constructor (
    @InjectRepository(Absen)
    private readonly AbsenRepository: Repository<Absen>,
  ){}

  create(CreateAbsenDto: CreateAbsenDto) {
    const absen = this.AbsenRepository.create(CreateAbsenDto)
    return this.AbsenRepository.save(absen)
  }

  findAll() {
    return this.AbsenRepository.find()
  }

  findById(id: number){
    return this.AbsenRepository.findOne({where: {id}})
  }

  findOne(id: number) {
    return this.AbsenRepository.findOne({where : {id}})
  }

  async update(id: number, updateAbsenDto: UpdateAbsenDto) {
    const absen = await this.findById(id)
    if(!absen){
      throw new NotFoundException();
    }
    Object.assign(absen, updateAbsenDto)
    return this.AbsenRepository.save(absen)
  }

  async remove(id: number) {
    const absen = await this.findById(id)
    if(!absen){
      throw new NotFoundException()
    }
    return await this.AbsenRepository.remove(absen)
  }
}
