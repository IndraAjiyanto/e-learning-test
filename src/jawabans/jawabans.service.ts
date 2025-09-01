import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJawabanDto } from './dto/create-jawaban.dto';
import { UpdateJawabanDto } from './dto/update-jawaban.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Jawaban } from 'src/entities/jawaban.entity';
import { Repository } from 'typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';

@Injectable()
export class JawabansService {
        @InjectRepository(Jawaban)
        private readonly jawabanRepository: Repository<Jawaban>
        @InjectRepository(Pertanyaan)
        private readonly pertanyaanRepository: Repository<Pertanyaan>
  async create(createJawabanDto: CreateJawabanDto) {
              const pertanyaan = await this.pertanyaanRepository.findOne({where: {id: createJawabanDto.pertanyaanId}})
            if(!pertanyaan){
              throw new NotFoundException('pertemuan ini tidak ada')
            }
    
              const jawaban = await this.jawabanRepository.create({
              ...createJawabanDto,
              pertanyaan: pertanyaan
            })
            return await this.jawabanRepository.save(jawaban)
  }

  findAll() {
    return `This action returns all jawabans`;
  }

  async findJawabanBenar(pertanyaanId: number){
    return await this.jawabanRepository.find({where: {pertanyaan: {id:pertanyaanId}}})
    }

  findOne(id: number) {
    return `This action returns a #${id} jawaban`;
  }

  update(id: number, updateJawabanDto: UpdateJawabanDto) {
    return `This action updates a #${id} jawaban`;
  }

  remove(id: number) {
    return `This action removes a #${id} jawaban`;
  }
}
