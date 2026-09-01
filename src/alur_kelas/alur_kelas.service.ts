import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlurKelaDto } from './dto/create-alur_kela.dto';
import { UpdateAlurKelaDto } from './dto/update-alur_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AlurKelas } from 'src/entities/alur_kelas.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';

@Injectable()
export class AlurKelasService {
  constructor(
    @InjectRepository(AlurKelas)
    private readonly alurKelasRepository: Repository<AlurKelas>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  async create(createAlurKelaDto: CreateAlurKelaDto) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: createAlurKelaDto.kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }

    const alurTerakhir = await this.findAlurKelas(createAlurKelaDto.kelasId);
    createAlurKelaDto.alur_ke = alurTerakhir + 1;

    const alur_kelas = this.alurKelasRepository.create({
      ...createAlurKelaDto,
      kelas: kelas,
    });
    return await this.alurKelasRepository.save(alur_kelas);
  }

  async noAlur(kelasId: string) {
    const alurTerakhir = await this.findAlurKelas(kelasId);
    const aluBaru = alurTerakhir + 1;
    return aluBaru;
  }

  async findAlurKelas(kelasId: string) {
    const alur_kelas = await this.alurKelasRepository.findOne({
      where: { kelas: { id: kelasId } },
      order: { alur_ke: 'DESC' },
    });
    if (!alur_kelas) {
      return 0;
    }
    return alur_kelas.alur_ke;
  }

  async findAll() {
    const alur_kelas = await this.alurKelasRepository.find({
      relations: ['kelas'],
      order: { kelas: { createdAt: 'ASC' }, alur_ke: 'ASC' },
    });
    return alur_kelas;
  }

  async findAllKelas() {
    const kelas = await this.kelasRepository.find({
      order: { createdAt: 'ASC' },
    });
    return kelas;
  }

  async findOne(alurKelasId: string) {
    const alur_kelas = await this.alurKelasRepository.findOne({
      where: { id: alurKelasId },
      relations: ['kelas'],
    });
    if (!alur_kelas) {
      throw new NotFoundException('Flow Program not found');
    }
    return alur_kelas;
  }

  async update(alurKelasId: string, updateAlurKelaDto: UpdateAlurKelaDto) {
    const alur_kelas = await this.findOne(alurKelasId);
    if (!alur_kelas) {
      throw new NotFoundException('Flow Program not found');
    }

    Object.assign(alur_kelas, updateAlurKelaDto);
    return await this.alurKelasRepository.save(alur_kelas);
  }

  async remove(alurKelasId: string, kelasId) {
    const alur_kelas = await this.findOne(alurKelasId);
    if (!alur_kelas) {
      throw new NotFoundException('Flow Program not found');
    }
    await this.alurKelasRepository.remove(alur_kelas);
    const semua_alur_kelas = await this.alurKelasRepository.find({
      where: { kelas: { id: kelasId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < semua_alur_kelas.length; i++) {
      semua_alur_kelas[i].alur_ke = i + 1;
      await this.alurKelasRepository.save(semua_alur_kelas[i]);
    }
  }
}
