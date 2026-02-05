import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tugas } from 'src/entities/tugas.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TugassService {
  @InjectRepository(Tugas)
  private readonly tugasRepository: Repository<Tugas>;
  @InjectRepository(Pertemuan)
  private readonly pertemuanRepository: Repository<Pertemuan>;

  async create(createTugassDto: CreateTugassDto) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id: createTugassDto.pertemuanId },
    });
    if (!pertemuan) {
      throw new NotFoundException('pertemuan ini tidak ada');
    }
    const tugas = await this.tugasRepository.create({
      ...createTugassDto,
      pertemuan: pertemuan,
    });
    return await this.tugasRepository.save(tugas);
  }

  async findOne(id: number) {
    const tugas = await this.tugasRepository.findOne({ where: { id: id } });
    if (!tugas) {
      throw new NotFoundException('tugas not found');
    }
    return tugas;
  }

  update(id: number, updateTugassDto: UpdateTugassDto) {
    return `This action updates a #${id} tugass`;
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


  async remove(tugasId: number) {
    const tugas = await this.tugasRepository.findOne({
      where: { id: tugasId },
    });
    if (!tugas) {
      throw new NotFoundException('tugas tidak ditemukan');
    }
    await this.tugasRepository.remove(tugas);
  }
}
