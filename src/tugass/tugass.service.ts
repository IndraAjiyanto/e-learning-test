import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tugas } from 'src/entities/tugas.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { v2 as cloudinary } from 'cloudinary';
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

  findAll() {
    return `This action returns all tugass`;
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
    // Convert URL ke full path
    // /uploads/alumni/123.jpg → /project-root/public/uploads/alumni/123.jpg
    const filePath = path.join(process.cwd(), 'public', url);
    
    // Hapus file
    await fs.unlink(filePath);
    console.log('File deleted:', filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File not found, skipping delete:', url);
    } else {
      console.error('Error deleting file:', error);
      // Tidak throw error agar proses lain tetap jalan
    }
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
