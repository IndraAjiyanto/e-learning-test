import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from 'src/entities/partner.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly PartnerRepository: Repository<Partner>,
  ) {}

  async create(createPartnerDto: CreatePartnerDto) {
    const kerja_sama =
      await this.PartnerRepository.create(createPartnerDto);
    return await this.PartnerRepository.save(kerja_sama);
  }

  async findAll() {
    return await this.PartnerRepository.find();
  }

  async findOne(kerja_samaId: number) {
    const kerja_sama = await this.PartnerRepository.findOne({
      where: { id: kerja_samaId },
    });
    if (!kerja_sama) {
      throw new NotFoundException('partnership not found');
    }
    return kerja_sama;
  }

  async update(kerja_samaId: number, updatePartnerDto: UpdatePartnerDto) {
    const kerja_sama = await this.findOne(kerja_samaId);
    if (!kerja_sama) {
      throw new NotFoundException('partnership not found');
    }
    Object.assign(kerja_sama, updatePartnerDto);
    return await this.PartnerRepository.save(kerja_sama);
  }

  async remove(kerja_samaId: number) {
    const kerja_sama = await this.findOne(kerja_samaId);
    if (!kerja_sama) {
      throw new NotFoundException('partnership not found');
    }
    return await this.PartnerRepository.remove(kerja_sama);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
