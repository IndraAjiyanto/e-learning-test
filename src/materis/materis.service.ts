import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JenisFile, Materi } from 'src/entities/materi.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MaterisService {
  constructor(
    @InjectRepository(Materi)
    private readonly materiRepository: Repository<Materi>,
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,
  ) {}
  async create(createMaterisDto: CreateMaterisDto) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id: createMaterisDto.pertemuanId },
    });
    if (!pertemuan) {
      throw new NotFoundException('pertemuan ini tidak ada');
    }
    const materi = await this.materiRepository.create({
      ...createMaterisDto,
      pertemuan: pertemuan,
    });
    return await this.materiRepository.save(materi);
  }

  async findMateriBypertemuan(pertemuanId: number) {
    return await this.materiRepository.find({
      where: { pertemuan: { id: pertemuanId } },
      relations: ['pertemuan'],
    });
  }

  async findMateriPdf(pertemuanId: number) {
    return await this.materiRepository.find({
      where: { pertemuan: { id: pertemuanId }, jenis_file: 'pdf' },
    });
  }

  async findMateriPpt(pertemuanId: number) {
    const materiList = await this.materiRepository.find({
      where: { pertemuan: { id: pertemuanId }, jenis_file: 'ppt' },
    });

    return materiList;
  }

  async findPertemuan(pertemuanId: number) {
    return await this.pertemuanRepository.findOne({
      where: { id: pertemuanId },
      relations: ['minggu', 'minggu.kelas'],
    });
  }

  async findMateriVideo(pertemuanId: number) {
    return await this.materiRepository.find({
      where: { pertemuan: { id: pertemuanId }, jenis_file: 'video' },
    });
  }

  async findPertemuanByKelas(mingguId: number) {
    const pertemuan = await this.pertemuanRepository.find({
      where: { minggu: { id: mingguId } },
      relations: ['materi'],
      order: { id: 'ASC' },
    });

    return pertemuan.map((p) => ({
      ...p,
      materiPdf: p.materi.filter((m) => m.jenis_file === 'pdf'),
      materiVideo: p.materi.filter((m) => m.jenis_file === 'video'),
      materiPpt: p.materi.filter((m) => m.jenis_file === 'ppt'),
    }));
  }

  async findMateriByJenisAndPertemuan(mingguId: number, jenis_file: JenisFile) {
    return await this.materiRepository.find({
      where: {
        jenis_file: jenis_file,
        pertemuan: { minggu: { id: mingguId } },
      },
    });
  }

  async findIdentityMateri(jenis_file: JenisFile, pertemuanId: number) {
    return await this.materiRepository.find({
      where: { jenis_file: jenis_file, pertemuan: { id: pertemuanId } },
      relations: ['pertemuan'],
    });
  }

  async findOne(id: number) {
    const materi = await this.materiRepository.findOne({
      where: { id },
      relations: ['pertemuan'],
    });
    if (!materi) {
      throw new NotFoundException(`materi tidak ditemukan`);
    }

    if (!materi.pertemuan) {
      throw new NotFoundException('pertemuan tidak ditemukan');
    }

    return materi;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
      } else {
      }
    }
  }

  async update(id: number, updateMaterisDto: UpdateMaterisDto) {
    const materi = await this.findOne(id);
    if (!materi) {
      throw new NotFoundException('materi tidak ditemukan');
    }
    Object.assign(materi, updateMaterisDto);
    return await this.materiRepository.save(materi);
  }

  async remove(materiId: number) {
    const materi = await this.findOne(materiId);
    if (!materi) {
      throw new NotFoundException('materi tidak ditemukan');
    }

    if (materi.jenis_file == 'pdf') {
      await this.deleteFile(materi.file);
    }

    return await this.materiRepository.remove(materi);
  }
}
