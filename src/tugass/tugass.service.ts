import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tugas } from 'src/entities/tugas.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';

@Injectable()
export class TugassService {
      @InjectRepository(Tugas)
      private readonly tugasRepository: Repository<Tugas>
      @InjectRepository(Pertemuan)
      private readonly pertemuanRepository: Repository<Pertemuan>
      
  async create(createTugassDto: CreateTugassDto) {
    const pertemuan = await this.pertemuanRepository.findOne({where: {id: createTugassDto.pertemuanId}})
    if(!pertemuan){
        throw new NotFoundException('pertemuan ini tidak ada')
    }
            const tugas = await this.tugasRepository.create({
          ...createTugassDto,
          pertemuan: pertemuan,
        })
        return await this.tugasRepository.save(tugas)
  }

  findAll() {
    return `This action returns all tugass`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tugass`;
  }

  update(id: number, updateTugassDto: UpdateTugassDto) {
    return `This action updates a #${id} tugass`;
  }

  remove(id: number) {
    return `This action removes a #${id} tugass`;
  }
}
