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
    private aboutRepository: Repository<About>,
  ) {}

  async create(createTentangDto: CreateAboutDto) {
    const about = await this.aboutRepository.create({
      ...createTentangDto,
    });
    return await this.aboutRepository.save(about);
  }

  async findAll() {
    return await this.aboutRepository.find();
  }

  async findOne(id: number) {
    const about = await this.aboutRepository.findOne({ where: { id } });
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
    return await this.aboutRepository.save(about);
  }

  async remove(id: number) {
    const about = await this.findOne(id);
    if (!about) {
      throw new NotFoundException('Header not found');
    }
    return await this.aboutRepository.remove(about);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
