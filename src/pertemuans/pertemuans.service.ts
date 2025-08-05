import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';

@Injectable()
export class PertemuansService {
  constructor(
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>
  ){}

  async create(createPertemuanDto: CreatePertemuanDto) {
    const kelas = await this.kelasRepository.findOne({where: {id: createPertemuanDto.kelasId}})
    if(!kelas){
      throw new NotFoundException('kelas ini tidak ada')
    }
    const user = await this.pertemuanRepository.create({
      ...createPertemuanDto,
      kelas: kelas,
    })
    return await this.pertemuanRepository.save(user)
  }

  async findAll() {
    return await this.pertemuanRepository.find({
      relations: ['kelas']
    })
  }

  // async findByKelas(id: number){
  //       const pertemuan = await this.pertemuanRepository.find({
  //     where: {id},
  //     relations: ['kelas']
  //   })
  //   if (!pertemuan) {
  //     throw new NotFoundException(`Pertemuan tidak ditemukan`);
  //   }

  //   if (!pertemuan.kelas) {
  //     throw new NotFoundException('kelas tidak ditemukan');
  //   }

  //   return pertemuan;
  // }

  async findOne(id: number) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: {id},
      relations: ['kelas']
    })
    if (!pertemuan) {
      throw new NotFoundException(`Pertemuan tidak ditemukan`);
    }

    if (!pertemuan.kelas) {
      throw new NotFoundException('kelas tidak ditemukan');
    }

    return pertemuan;
  }

  async update(id: number, updatePertemuanDto: UpdatePertemuanDto) {
    const pertemuan = await this.findOne(id)
    if(!pertemuan){
      throw new NotFoundException('pertemuan tidak ditemukan');
    }
    Object.assign(pertemuan, updatePertemuanDto)
    return await this.pertemuanRepository.save(pertemuan)
  }

  async remove(id: number) {
    const pertemuan = await this.findOne(id)
    if(!pertemuan){
      throw new NotFoundException('pertemuan tidak ditemukan')
    }
    return await this.pertemuanRepository.remove(pertemuan)
  }
}
