import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGambarBenefitDto } from './dto/create-gambar_benefit.dto';
import { UpdateGambarBenefitDto } from './dto/update-gambar_benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GambarBenefit } from 'src/entities/gambar_benefit.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class GambarBenefitService {
  constructor(
    @InjectRepository(GambarBenefit)
    private readonly gambarBenefitRepository: Repository<GambarBenefit>,
  ) {}

  async create(createGambarBenefitDto: CreateGambarBenefitDto) {
    const gambar_benefit = await this.gambarBenefitRepository.create(
      createGambarBenefitDto,
    );
    return await this.gambarBenefitRepository.save(gambar_benefit);
  }

  async findAll() {
    return await this.gambarBenefitRepository.find({
      order: { no: 'ASC' },
    });
  }

  async findOne(gambarBenefitId: number) {
    const gambar_benefit = await this.gambarBenefitRepository.findOne({
      where: { id: gambarBenefitId },
    });
    if (!gambar_benefit) {
      throw new NotFoundException('Image Benefit Not Found');
    }
    return gambar_benefit;
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

  async update(
    gambarBenefitId: number,
    updateGambarBenefitDto: UpdateGambarBenefitDto,
  ) {
    const gambar_benefit = await this.findOne(gambarBenefitId);
    if (!gambar_benefit) {
      throw new NotFoundException('Image Benefit Not Found');
    }
    Object.assign(gambar_benefit, updateGambarBenefitDto);
    return await this.gambarBenefitRepository.save(gambar_benefit);
  }

  async remove(gambarBenefitId: number) {
    const gambar_benefit = await this.findOne(gambarBenefitId);
    if (!gambar_benefit) {
      throw new NotFoundException();
    }
    return await this.gambarBenefitRepository.remove(gambar_benefit);
  }
}
