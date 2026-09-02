import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from 'src/entities/partner.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CategoryPartnerService } from 'src/category_partner/category_partner.service';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly PartnerRepository: Repository<Partner>,
    private readonly categoryPartnerService: CategoryPartnerService,
  ) {}

  async create(createPartnerDto: CreatePartnerDto) {
    const categoryPartner = await this.categoryPartnerService.findOne(
      createPartnerDto.categoryPartnerId,
    );
    const kerja_sama = this.PartnerRepository.create({
      ...createPartnerDto,
      categoryPartner,
    });
    return await this.PartnerRepository.save(kerja_sama);
  }

  async findAll() {
    return await this.PartnerRepository.find({
      relations: ['categoryPartner'],
    });
  }

  async findOne(kerja_samaId: string) {
    const kerja_sama = await this.PartnerRepository.findOne({
      where: { id: kerja_samaId },
      relations: ['categoryPartner'],
    });
    if (!kerja_sama) {
      throw new NotFoundException('partnership not found');
    }
    return kerja_sama;
  }

  async update(kerja_samaId: string, updatePartnerDto: UpdatePartnerDto) {
    const kerja_sama = await this.findOne(kerja_samaId);
    if (!kerja_sama) {
      throw new NotFoundException('partnership not found');
    }
    if (updatePartnerDto.categoryPartnerId) {
      kerja_sama.categoryPartner = await this.categoryPartnerService.findOne(
        updatePartnerDto.categoryPartnerId,
      );
    }
    Object.assign(kerja_sama, updatePartnerDto);
    return await this.PartnerRepository.save(kerja_sama);
  }

  async remove(kerja_samaId: string) {
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
