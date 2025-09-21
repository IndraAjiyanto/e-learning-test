import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertanyaanUmumDto } from './dto/create-pertanyaan_umum.dto';
import { UpdatePertanyaanUmumDto } from './dto/update-pertanyaan_umum.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PertanyaanUmumService {
    constructor(
      @InjectRepository(PertanyaanUmum)
      private readonly pertanyaanUmumRepository: Repository<PertanyaanUmum>,
    ){}

  async create(createPertanyaanUmumDto: CreatePertanyaanUmumDto) {
    const data = await this.pertanyaanUmumRepository.create(createPertanyaanUmumDto)
    return await this.pertanyaanUmumRepository.save(data)
  }

  async findAll() {
    return await this.pertanyaanUmumRepository.find()
  }

  async findOne(pertanyaan_umumId: number) {
    return await this.pertanyaanUmumRepository.findOne({where: {id: pertanyaan_umumId}})
  }

  async update(pertanyaan_umumId: number, updatePertanyaanUmumDto: UpdatePertanyaanUmumDto) {
         const pertanyaan_umum = await this.findOne(pertanyaan_umumId)
        if(!pertanyaan_umum){
                  throw new NotFoundException('pertanyaan umum tidak ada');
        }
        Object.assign(pertanyaan_umum, updatePertanyaanUmumDto)
        return await this.pertanyaanUmumRepository.save(pertanyaan_umum)
  }

  async remove(pertanyaan_umumId: number) {
        const pertanyaan_umum = await this.findOne(pertanyaan_umumId)
    if(!pertanyaan_umum){
      throw new NotFoundException('pertanyaan umum tidak ada')
    }
    return await this.pertanyaanUmumRepository.remove(pertanyaan_umum)
  }
}
