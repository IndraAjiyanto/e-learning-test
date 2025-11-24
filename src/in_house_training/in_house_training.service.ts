import { Injectable } from '@nestjs/common';
import { CreateInHouseTrainingDto } from './dto/create-in_house_training.dto';
import { UpdateInHouseTrainingDto } from './dto/update-in_house_training.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';

@Injectable()
export class InHouseTrainingService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(JenisKelas)
    private readonly jenisKelasRepository: Repository<JenisKelas>,
    @InjectRepository(PertanyaanUmum)
    private readonly pertanyaanUmumRepository: Repository<PertanyaanUmum>,
  ) {}

  async findAll() {
    return await this.kelasRepository.find({
      where: { kategori: { nama_kategori: 'In House Training Program' } },
      relations: ['kategori', 'jenis_kelas', 'user_kelas'],
    });
  }

  async findJenisKelas() {
    return await this.jenisKelasRepository.find();
  }

  async findFaq() {
    return await this.pertanyaanUmumRepository.find({
      where: { kategori: { nama_kategori: 'In House Training Program' } },
    });
  }
}
