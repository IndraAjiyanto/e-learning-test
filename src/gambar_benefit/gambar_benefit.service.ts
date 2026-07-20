import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGambarBenefitDto } from './dto/create-gambar_benefit.dto';
import { UpdateGambarBenefitDto } from './dto/update-gambar_benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageBenefit } from 'src/entities/image_benefit.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

@Injectable()
export class GambarBenefitService {
  constructor(
    @InjectRepository(ImageBenefit)
    private readonly gambarBenefitRepository: Repository<ImageBenefit>,
  ) { }

  async create(createGambarBenefitDto: CreateGambarBenefitDto) {
    const image_benefit = await this.gambarBenefitRepository.create(
      createGambarBenefitDto,
    );
    return await this.gambarBenefitRepository.save(image_benefit);
  }

  async findAll() {
    return await this.gambarBenefitRepository.find({
      order: { no: 'ASC' },
    });
  }

  async findOne(gambarBenefitId: number) {
    const gambar_benefit = await this.gambarBenefitRepository.findOne({
      where: { id: gambarBenefitId },
    });
    if (!gambar_benefit) {
      throw new NotFoundException('Image Benefit Not Found');
    }
    return gambar_benefit;
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
    updateGambarBenefitDto: UpdateGambarBenefitDto,
  ) {
    const gambar_benefit = await this.findOne(gambarBenefitId);
    if (!gambar_benefit) {
      throw new NotFoundException('Image Benefit Not Found');
    }
    // Cek apakah no yang diinginkan sudah dipakai data lain
    const gambar_benefit_no_used = await this.gambarBenefitRepository.findOne({
      where: { no: updateGambarBenefitDto.no },
    });

    // Kalau sudah dipakai dan bukan data yang sama, swap nomor
    if (gambar_benefit_no_used && gambar_benefit_no_used.id !== gambarBenefitId) {
      gambar_benefit_no_used.no = gambar_benefit.no; // data lain ambil no lama
      await this.gambarBenefitRepository.save(gambar_benefit_no_used);
    }
    Object.assign(gambar_benefit, updateGambarBenefitDto);
    return await this.gambarBenefitRepository.save(gambar_benefit);
  }

  async remove(gambarBenefitId: number) {
    const gambar_benefit = await this.findOne(gambarBenefitId);
    if (!gambar_benefit) {
      throw new NotFoundException();
    }
    return await this.gambarBenefitRepository.remove(gambar_benefit);
  }
}
