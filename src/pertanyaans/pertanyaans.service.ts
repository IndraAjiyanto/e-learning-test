import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertanyaanDto } from './dto/create-pertanyaan.dto';
import { UpdatePertanyaanDto } from './dto/update-pertanyaan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Jawaban } from 'src/entities/jawaban.entity';

@Injectable()
export class PertanyaansService {
      @InjectRepository(Pertanyaan)
      private readonly pertanyaanRepository: Repository<Pertanyaan>
      @InjectRepository(Pertemuan)
      private readonly pertemuanRepository: Repository<Pertemuan>
      @InjectRepository(Jawaban)
      private readonly jawabanRepository: Repository<Jawaban>
  async create(createPertanyaanDto: CreatePertanyaanDto) {
          const pertemuan = await this.pertemuanRepository.findOne({where: {id: createPertanyaanDto.pertemuanId}})
        if(!pertemuan){
          throw new NotFoundException('pertemuan ini tidak ada')
        }

          const pertanyaan = await this.pertanyaanRepository.create({
          pertanyaan_soal: createPertanyaanDto.pertanyaan_soal,
          pertemuan: pertemuan
        })
        return await this.pertanyaanRepository.save(pertanyaan)
  }

  findAll() {
    return `This action returns all pertanyaans`;
  }

  async findPertanyaan(pertemuanId: number){
    return await this.pertanyaanRepository.find({where: {pertemuan: {id: pertemuanId}}, relations: ['jawaban.jawaban_user']})
  }

  async findOne(pertanyaanId: number) {
    return await this.pertanyaanRepository.findOne({where: {id: pertanyaanId}})
  }

  update(id: number, updatePertanyaanDto: UpdatePertanyaanDto) {
    return `This action updates a #${id} pertanyaan`;
  }

  async remove(pertanyaanId: number) {
    const pertanyaan = await this.findOne(pertanyaanId)
    if(!pertanyaan){
      throw new NotFoundException('pertanyaan tidak ditemukan')
    }
    await this.pertanyaanRepository.remove(pertanyaan)
  }
}
