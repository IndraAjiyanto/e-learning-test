import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollaborationsDto } from './dto/create-collaborations.dto';
import { UpdateCollaborationsDto } from './dto/update-collaborations.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Collaboration } from 'src/entities/collaboration.entity';

@Injectable()
export class CollaborationsService {
  constructor(
    @InjectRepository(Collaboration)
    private readonly kerjaSamaRepository: Repository<Collaboration>,
  ) {}

  async create(createCollaborationsDto: CreateCollaborationsDto) {
    const kerja_sama =
      await this.kerjaSamaRepository.create(createCollaborationsDto);
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

  async update(kerja_samaId: number, updateKerjaSamaDto: UpdateCollaborationsDto) {
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
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
