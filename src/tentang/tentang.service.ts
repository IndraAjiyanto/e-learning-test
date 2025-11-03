import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTentangDto } from './dto/create-tentang.dto';
import { UpdateTentangDto } from './dto/update-tentang.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tentang } from 'src/entities/tentang.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class TentangService {
  constructor(
    @InjectRepository(Tentang)
    private readonly tentangRepository: Repository<Tentang>,
  ) {}

  async create(createTentangDto: CreateTentangDto) {
    const tentang = this.tentangRepository.create(createTentangDto);
    return await this.tentangRepository.save(tentang);
  }

  async findAll() {
    return await this.tentangRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const tentang = await this.tentangRepository.findOne({
      where: { id },
    });
    if (!tentang) {
      throw new NotFoundException('Tentang not found');
    }
    return tentang;
  }

  async getPublicIdFromUrl(url: string) {
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      return null;
    }

    let path = parts[1];
    path = path.replace(/^v[0-9]+\/?/, '');
    path = path.replace(/\.[^.]+$/, '');

    console.log('Public ID:', path);
    await this.deleteFileIfExists(path);
  }

  async deleteFileIfExists(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
        console.log('File not found in Cloudinary.');
      } else {
        console.log('File deleted from Cloudinary:', result);
      }
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }

  async update(id: number, updateTentangDto: UpdateTentangDto) {
    const tentang = await this.findOne(id);
    if (!tentang) {
      throw new NotFoundException('Tentang not found');
    }

    if (updateTentangDto.judul) tentang.judul = updateTentangDto.judul;
    if (updateTentangDto.text) tentang.text = updateTentangDto.text;
    if (updateTentangDto.gambar) tentang.gambar = updateTentangDto.gambar;

    return await this.tentangRepository.save(tentang);
  }

  async remove(id: number) {
    const tentang = await this.findOne(id);
    if (!tentang) {
      throw new NotFoundException('Tentang not found');
    }
    return await this.tentangRepository.remove(tentang);
  }
}
