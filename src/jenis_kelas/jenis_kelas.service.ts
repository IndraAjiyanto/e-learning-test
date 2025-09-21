import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJenisKelaDto } from './dto/create-jenis_kela.dto';
import { UpdateJenisKelaDto } from './dto/update-jenis_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JenisKelasService {
  constructor(
            @InjectRepository(JenisKelas)
            private readonly jenisKelasRepository: Repository<JenisKelas>

  ){}
  async create(createJenisKelaDto: CreateJenisKelaDto) {
    const jenis_kelas = await this.jenisKelasRepository.create(createJenisKelaDto)
    return await this.jenisKelasRepository.save(jenis_kelas)
  }

  async findAll() {
    return await this.jenisKelasRepository.find()
  }

  async findOne(jenis_kelasId: number) {
    const jenis_kelas = await this.jenisKelasRepository.findOne({where: {id: jenis_kelasId}})
    if(!jenis_kelas){
          throw new NotFoundException('jenis kelas not found')
    }
    return jenis_kelas
  }

  async update(jenis_kelasId: number, updateJenisKelaDto: UpdateJenisKelaDto) {
        const jenis_kelas = await this.findOne(jenis_kelasId)
        if(!jenis_kelas){
          throw new NotFoundException('jenis kelas not found')
        }
        Object.assign(jenis_kelas, updateJenisKelaDto)
        return await this.jenisKelasRepository.save(jenis_kelas)
  }

  async remove(jenis_kelasId: number) {
        const jenis_kelas = await this.findOne(jenis_kelasId)
    if(!jenis_kelas){
      throw new NotFoundException()
    }
    return await this.jenisKelasRepository.remove(jenis_kelas)
  }
}
