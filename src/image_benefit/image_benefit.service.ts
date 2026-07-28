import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateImageBenefitDto } from './dto/create-image_benefit.dto';
import { UpdateImageBenefitDto } from './dto/update-image_benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageBenefit } from 'src/entities/image_benefit.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

@Injectable()
export class ImageBenefitService {
  constructor(
    @InjectRepository(ImageBenefit)
    private readonly gambarBenefitRepository: Repository<ImageBenefit>,
  ) { }

  async create(createImageBenefitDto: CreateImageBenefitDto) {
    const image_benefit = await this.gambarBenefitRepository.create(
      createImageBenefitDto,
    );
    return await this.gambarBenefitRepository.save(image_benefit);
  }

  async findAll() {
    return await this.gambarBenefitRepository.find({
      order: { no: 'ASC' },
    });
  }

  async findOne(gambarBenefitId: number) {
    const image_benefit = await this.gambarBenefitRepository.findOne({
      where: { id: gambarBenefitId },
    });
    if (!image_benefit) {
      throw new NotFoundException('Image Benefit Not Found');
    }
    return image_benefit;
  }

  async findNo() {
    const benefit = await this.findAll();
    const usedNumbers = benefit.map((b) => Number(b.no));

    const availableNumbers = [1, 2, 3, 4].filter(
      (n) => !usedNumbers.includes(n)
    );
    return availableNumbers;
  }

  async deleteFile(url: string) {
    if (!url) return;
    const filePath = path.join(process.cwd(), 'public', url);
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }

  }

  async update(
    gambarBenefitId: number,
    updateImageBenefitDto: UpdateImageBenefitDto,
  ) {
    const image_benefit = await this.findOne(gambarBenefitId);
    if (!image_benefit) {
      throw new NotFoundException('Image Benefit Not Found');
    }
    // Cek apakah no yang diinginkan sudah dipakai data lain
    const image_benefit_no_used = await this.gambarBenefitRepository.findOne({
      where: { no: updateImageBenefitDto.no },
    });

    // Kalau sudah dipakai dan bukan data yang sama, swap nomor
    if (image_benefit_no_used && image_benefit_no_used.id !== gambarBenefitId) {
      image_benefit_no_used.no = image_benefit.no; // data lain ambil no lama
      await this.gambarBenefitRepository.save(image_benefit_no_used);
    }
    Object.assign(image_benefit, updateImageBenefitDto);
    return await this.gambarBenefitRepository.save(image_benefit);
  }

  async remove(gambarBenefitId: number) {
    const image_benefit = await this.findOne(gambarBenefitId);
    if (!image_benefit) {
      throw new NotFoundException();
    }
    return await this.gambarBenefitRepository.remove(image_benefit);
  }
}
