import { Injectable } from '@nestjs/common';
import { CreateWipDto } from './dto/create-wip.dto';
import { UpdateWipDto } from './dto/update-wip.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Alumni } from 'src/entities/alumni.entity';

@Injectable()
export class WipService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(JenisKelas)
    private readonly jenisKelasRepository: Repository<JenisKelas>,
    @InjectRepository(Kategori)
    private readonly kategoriRepository: Repository<Kategori>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
  ) {}

  create(createWipDto: CreateWipDto) {
    return 'This action adds a new wip';
  }

  async findAll() {
    const kelas = await this.kelasRepository.find({
      where: { kategori: { nama_kategori: 'WIP' } },
      relations: ['kategori', 'jenis_kelas', 'user_kelas'],
    });

    // Add percentage calculation for progress bar
    return kelas.map((k) => ({
      ...k,
      quotaPercentage:
        k.kuota > 0 ? Math.round((k.user_kelas.length / k.kuota) * 100) : 0,
    }));
  }

  async findJenisKelas() {
    return await this.jenisKelasRepository.find();
  }

  async findAlumni() {
    return await this.alumniRepository.find({
      where: { kelas: { kategori: { nama_kategori: 'WIP' } } },
      relations: ['kelas'],
    });
  }
}
