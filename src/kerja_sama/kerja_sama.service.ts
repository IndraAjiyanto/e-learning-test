import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKerjaSamaDto } from './dto/create-kerja_sama.dto';
import { UpdateKerjaSamaDto } from './dto/update-kerja_sama.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { KerjaSama } from 'src/entities/kerja_sama.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class KerjaSamaService {
  constructor(
    @InjectRepository(KerjaSama)
    private readonly kerjaSamaRepository: Repository<KerjaSama>,
  ) {}

  async create(createKerjaSamaDto: CreateKerjaSamaDto) {
    const kerja_sama =
      await this.kerjaSamaRepository.create(createKerjaSamaDto);
    return await this.kerjaSamaRepository.save(kerja_sama);
  }

  async findAll() {
    return await this.kerjaSamaRepository.find();
  }

  async findOne(kerja_samaId: number) {
    const kerja_sama = await this.kerjaSamaRepository.findOne({
      where: { id: kerja_samaId },
    });
    if (!kerja_sama) {
      throw new NotFoundException('partnership not found');
    }
    return kerja_sama;
  }

  async getPublicIdFromUrl(url: string) {
    // Pisahkan berdasarkan "/upload/"
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      return null;
    }

    // Ambil bagian setelah upload/
    let path = parts[1];

    // Hapus "v1234567890/" (versi auto Cloudinary)
    path = path.replace(/^v[0-9]+\/?/, '');

    // Buang extension (.jpg, .png, .pdf, dll)
    path = path.replace(/\.[^.]+$/, '');


    await this.deleteFileIfExists(path);
  }

  async deleteFileIfExists(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
      } else {
      }
    } catch (error) {
      throw error;
    }
  }

  async update(kerja_samaId: number, updateKerjaSamaDto: UpdateKerjaSamaDto) {
    const kerja_sama = await this.findOne(kerja_samaId);
    if (!kerja_sama) {
      throw new NotFoundException('partnership not found');
    }
    Object.assign(kerja_sama, updateKerjaSamaDto);
    return await this.kerjaSamaRepository.save(kerja_sama);
  }

  async remove(kerja_samaId: number) {
    const kerja_sama = await this.findOne(kerja_samaId);
    if (!kerja_sama) {
      throw new NotFoundException('partnership not found');
    }
    return await this.kerjaSamaRepository.remove(kerja_sama);
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
}
