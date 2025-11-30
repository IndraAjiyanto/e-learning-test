import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTentangDto } from './dto/create-tentang.dto';
import { UpdateTentangDto } from './dto/update-tentang.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tentang } from 'src/entities/tentang.entity';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class TentangService {
  constructor(
    @InjectRepository(Tentang)
    private tentangRepository: Repository<Tentang>,
  ) {}

  async create(createTentangDto: CreateTentangDto) {
    const tentang = await this.tentangRepository.create({...createTentangDto
    });
    return await this.tentangRepository.save(tentang)

  }

  async findAll() {
    return await this.tentangRepository.find();
  }

  async findOne(id: number) {
    const tentang = await this.tentangRepository.findOne({ where: { id } });
    if (!tentang) {
      throw new NotFoundException('Header not found');
    }
    return tentang;
  }

  async update(id: number, updateTentangDto: UpdateTentangDto) {
    const tentang = await this.findOne(id);
    if (!tentang) {
      throw new NotFoundException('Header not found');
    }
    Object.assign(tentang, updateTentangDto);
    return await this.tentangRepository.save(tentang);
  }

  async remove(id: number) {
    const tentang = await this.findOne(id);
    if (!tentang) {
      throw new NotFoundException('Header not found');
    }
    return await this.tentangRepository.remove(tentang);
  }

  async getPublicIdFromUrl(imageUrl: string): Promise<string | null> {
    try {
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      const folder = parts.slice(-2, -1)[0];
      const fullPublicId = `${folder}/${publicId}`;

      await cloudinary.uploader.destroy(fullPublicId);
      return fullPublicId;
    } catch (error) {
      return null;
    }
  }
}
