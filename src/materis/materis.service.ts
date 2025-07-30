import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Materi } from 'src/entities/materi.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';

@Injectable()
export class MaterisService {
  constructor(
    @InjectRepository(Materi)
    private readonly materiRepository: Repository<Materi>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>
  ){}
  async create(createMaterisDto: CreateMaterisDto) {
        const kelas = await this.kelasRepository.findOne({where: {id: createMaterisDto.kelasId}})
        if(!kelas){
          throw new NotFoundException('kelas ini tidak ada')
        }
        const materi = await this.materiRepository.create({
          ...createMaterisDto,
          kelas: kelas,
        })
        return await this.materiRepository.save(materi)
  }

  async findAll() {
      return await this.materiRepository.find({
      relations: ['kelas']
    })
  }

  async findOne(id: number) {
      const materi = await this.materiRepository.findOne({
      where: {id},
      relations: ['kelas']
    })
    if (!materi) {
      throw new NotFoundException(`materi tidak ditemukan`);
    }

    if (!materi.kelas) {
      throw new NotFoundException('kelas tidak ditemukan');
    }

    return materi;
  }

  async update(id: number, updateMaterisDto: UpdateMaterisDto) {
    const materi = await this.findOne(id)
    if(!materi){
      throw new NotFoundException('materi tidak ditemukan');
    }
    Object.assign(materi, updateMaterisDto)
    return await this.materiRepository.save(materi)
  }

  async remove(id: number) {
    const materi = await this.findOne(id)
    if(!materi){
      throw new NotFoundException('materi tidak ditemukan')
    }
    return await this.materiRepository.remove(materi)
  }
}
