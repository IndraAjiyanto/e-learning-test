import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertanyaanKelaDto } from './dto/create-pertanyaan_kela.dto';
import { UpdatePertanyaanKelaDto } from './dto/update-pertanyaan_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PertanyaanKelas } from 'src/entities/pertanyaan_kelas.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';

@Injectable()
export class PertanyaanKelasService {
  constructor(
    @InjectRepository(PertanyaanKelas)
    private pertanyaanKelasRepository: Repository<PertanyaanKelas>,
    @InjectRepository(Kelas)
    private kelasRepository: Repository<Kelas>,
  ) {}

  async create(createPertanyaanKelaDto: CreatePertanyaanKelaDto) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: createPertanyaanKelaDto.kelasId },
    });

    if (!kelas) {
      throw new NotFoundException('Program not found');
    }

    const pertanyaanKelas = this.pertanyaanKelasRepository.create({
      pertanyaan: createPertanyaanKelaDto.pertanyaan,
      jawaban: createPertanyaanKelaDto.jawaban,
      kelas: kelas,
    });

    return await this.pertanyaanKelasRepository.save(pertanyaanKelas);
  }

  async findAll() {
    return await this.pertanyaanKelasRepository.find({
      relations: ['kelas'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllKelas() {
    return await this.kelasRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const pertanyaanKelas = await this.pertanyaanKelasRepository.findOne({
      where: { id },
      relations: ['kelas'],
    });

    if (!pertanyaanKelas) {
      throw new NotFoundException('FAQ program not found');
    }

    return pertanyaanKelas;
  }

  async update(id: string, updatePertanyaanKelaDto: UpdatePertanyaanKelaDto) {
    const pertanyaanKelas = await this.findOne(id);

    if (updatePertanyaanKelaDto.kelasId) {
      const kelas = await this.kelasRepository.findOne({
        where: { id: updatePertanyaanKelaDto.kelasId },
      });

      if (!kelas) {
        throw new NotFoundException('Program not found');
      }

      pertanyaanKelas.kelas = kelas;
    }

    Object.assign(pertanyaanKelas, updatePertanyaanKelaDto);
    return await this.pertanyaanKelasRepository.save(pertanyaanKelas);
  }

  async remove(id: string) {
    const pertanyaanKelas = await this.findOne(id);
    return await this.pertanyaanKelasRepository.remove(pertanyaanKelas);
  }
}
