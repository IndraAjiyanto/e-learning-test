import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertanyaanUmumDto } from './dto/create-pertanyaan_umum.dto';
import { UpdatePertanyaanUmumDto } from './dto/update-pertanyaan_umum.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PertanyaanUmumService {
  constructor(
    @InjectRepository(PertanyaanUmum)
    private readonly pertanyaanUmumRepository: Repository<PertanyaanUmum>,
  ) {}

  async create(createPertanyaanUmumDto: CreatePertanyaanUmumDto) {
    const { kategoriId, ...data } = createPertanyaanUmumDto;
    const kategori = await this.pertanyaanUmumRepository.manager.findOne(
      Kategori,
      { where: { id: kategoriId } },
    );
    if (!kategori) {
      throw new NotFoundException('Kategori not found');
    }
    const pertanyaanUmum = this.pertanyaanUmumRepository.create({
      ...data,
      kategori,
    });
    return await this.pertanyaanUmumRepository.save(pertanyaanUmum);
  }

  async findAll() {
    return await this.pertanyaanUmumRepository.find({
      relations: ['kategori'],
    });
  }

  async findOne(pertanyaan_umumId: number) {
    return await this.pertanyaanUmumRepository.findOne({
      where: { id: pertanyaan_umumId },
      relations: ['kategori'],
    });
  }

  async update(
    pertanyaan_umumId: number,
    updatePertanyaanUmumDto: UpdatePertanyaanUmumDto,
  ) {
    const pertanyaan_umum = await this.findOne(pertanyaan_umumId);
    if (!pertanyaan_umum) {
      throw new NotFoundException('FAQ Not Found');
    }
    const { kategoriId, ...data } = updatePertanyaanUmumDto;
    if (kategoriId) {
      const kategori = await this.pertanyaanUmumRepository.manager.findOne(
        Kategori,
        { where: { id: kategoriId } },
      );
      if (!kategori) {
        throw new NotFoundException('Kategori not found');
      }
      pertanyaan_umum.kategori = kategori;
    }
    Object.assign(pertanyaan_umum, data);
    return await this.pertanyaanUmumRepository.save(pertanyaan_umum);
  }

  async remove(pertanyaan_umumId: number) {
    const pertanyaan_umum = await this.findOne(pertanyaan_umumId);
    if (!pertanyaan_umum) {
      throw new NotFoundException('FAQ Not Found');
    }
    return await this.pertanyaanUmumRepository.remove(pertanyaan_umum);
  }

  async getKategori() {
    return await this.pertanyaanUmumRepository.manager.find(Kategori);
  }
}
