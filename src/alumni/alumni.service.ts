import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlumnusDto } from './dto/create-alumnus.dto';
import { UpdateAlumnusDto } from './dto/update-alumnus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Alumni } from 'src/entities/alumni.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AlumniService {
  constructor(
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}
  async create(createAlumnusDto: CreateAlumnusDto) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: createAlumnusDto.kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }
    const alumni = await this.alumniRepository.create({
      ...createAlumnusDto,
      kelas: kelas,
    });
    await this.alumniRepository.save(alumni);
  }

  async findAll() {
    return await this.alumniRepository.find({ relations: ['kelas'] });
  }

  async findAllKelas() {
    return await this.kelasRepository.find();
  }


  async findKelasByKategori(kategoriId: number) {
    return await this.kelasRepository.find({
      where: { kategori: { id: kategoriId } },
    });
  }

  async findOne(alumniId: number) {
    const alumni = await this.alumniRepository.findOne({
      where: { id: alumniId },relations: ['kelas','kelas.kategori']
    });
    if (!alumni) {
      throw new NotFoundException('Alumni not found');
    }
    return alumni;
  }


  async deleteFile(url: string) {
  if (!url) return;

  try {
    const filePath = path.join(process.cwd(), 'public', url);
    
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error('Failed to delete file: ' + error.message);
  }
}

  async update(alumniId: number, updateAlumnusDto: UpdateAlumnusDto) {
    const alumni = await this.findOne(alumniId);
    if (!alumni) {
      throw new NotFoundException('Alumni not found');
    }

    Object.assign(alumni, updateAlumnusDto);

    return await this.alumniRepository.save(alumni);
  }

  async remove(alumniId: number) {
    const alumni = await this.findOne(alumniId);
    if (!alumni) {
      throw new NotFoundException('Alumni not found');
    }
    return await this.alumniRepository.remove(alumni);
  }
}
