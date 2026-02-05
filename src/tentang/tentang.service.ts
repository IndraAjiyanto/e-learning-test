import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTentangDto } from './dto/create-tentang.dto';
import { UpdateTentangDto } from './dto/update-tentang.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tentang } from 'src/entities/tentang.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

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

  async deleteFile(url: string) {
  if (!url) return;

  try {
    const filePath = path.join(process.cwd(), 'public', url);
    
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error('Failed to delete file: ' + error.message);
  }
}
}
