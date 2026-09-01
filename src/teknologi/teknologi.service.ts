import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeknologiDto } from './dto/create-teknologi.dto';
import { UpdateTeknologiDto } from './dto/update-teknologi.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Teknologi } from 'src/entities/teknologi.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TeknologiService {
  constructor(
    @InjectRepository(Teknologi)
    private readonly teknologiRepository: Repository<Teknologi>,
  ) {}

  async create(createTeknologiDto: CreateTeknologiDto) {
    const teknologi = this.teknologiRepository.create(createTeknologiDto);
    return await this.teknologiRepository.save(teknologi);
  }

  async findAll() {
    return await this.teknologiRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const teknologi = await this.teknologiRepository.findOne({
      where: { id },
    });
    if (!teknologi) {
      throw new NotFoundException('Tech not found');
    }
    return teknologi;
  }

  async update(id: string, updateTeknologiDto: UpdateTeknologiDto) {
    const teknologi = await this.findOne(id);
    if (!teknologi) {
      throw new NotFoundException('Tech not found');
    }

    Object.assign(teknologi, updateTeknologiDto);
    return await this.teknologiRepository.save(teknologi);
  }

  async remove(id: string) {
    const teknologi = await this.findOne(id);
    if (!teknologi) {
      throw new NotFoundException('Tech not found');
    }
    return await this.teknologiRepository.remove(teknologi);
  }

  async deleteFile(fileUrl: string) {
    try {
      if (!fileUrl) return;
      const filePath = path.join(process.cwd(), 'public', fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {}
  }
}
