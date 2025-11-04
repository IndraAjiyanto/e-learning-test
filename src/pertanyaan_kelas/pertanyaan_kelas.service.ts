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
      throw new NotFoundException('Kelas not found');
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
      order: { id: 'DESC' },
    });
  }

  async findAllKelas() {
    return await this.kelasRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const pertanyaanKelas = await this.pertanyaanKelasRepository.findOne({
      where: { id },
      relations: ['kelas'],
    });

    if (!pertanyaanKelas) {
      throw new NotFoundException('PertanyaanKelas not found');
    }

    return pertanyaanKelas;
  }

  async update(id: number, updatePertanyaanKelaDto: UpdatePertanyaanKelaDto) {
    const pertanyaanKelas = await this.findOne(id);

    if (updatePertanyaanKelaDto.kelasId) {
      const kelas = await this.kelasRepository.findOne({
        where: { id: updatePertanyaanKelaDto.kelasId },
      });

      if (!kelas) {
        throw new NotFoundException('Kelas not found');
      }

      pertanyaanKelas.kelas = kelas;
    }

    Object.assign(pertanyaanKelas, updatePertanyaanKelaDto);
    return await this.pertanyaanKelasRepository.save(pertanyaanKelas);
  }

  async remove(id: number) {
    const pertanyaanKelas = await this.findOne(id);
    return await this.pertanyaanKelasRepository.remove(pertanyaanKelas);
  }
}
