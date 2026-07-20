import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { About } from 'src/entities/about.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private tentangRepository: Repository<About>,
  ) {}

  async create(createTentangDto: CreateAboutDto) {
    const about = await this.tentangRepository.create({
      ...createTentangDto,
    });
    return await this.tentangRepository.save(about);
  }

  async findAll() {
    return await this.tentangRepository.find();
  }

  async findOne(id: number) {
    const about = await this.tentangRepository.findOne({ where: { id } });
    if (!about) {
      throw new NotFoundException('Header not found');
    }
    return about;
  }

  async update(id: number, updateTentangDto: UpdateAboutDto) {
    const about = await this.findOne(id);
    if (!about) {
      throw new NotFoundException('Header not found');
    }
    Object.assign(about, updateTentangDto);
    return await this.tentangRepository.save(about);
  }

  async remove(id: number) {
    const about = await this.findOne(id);
    if (!about) {
      throw new NotFoundException('Header not found');
    }
    return await this.tentangRepository.remove(about);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
