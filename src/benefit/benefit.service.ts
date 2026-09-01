import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Benefit } from 'src/entities/benefit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BenefitService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
  ) {}

  async create(createBenefitDto: CreateBenefitDto) {
    const benefit = await this.benefitRepository.create(createBenefitDto);
    return await this.benefitRepository.save(benefit);
  }

  async findAll() {
    return await this.benefitRepository.find();
  }

  async findOne(benefitId: string) {
    const benefit = await this.benefitRepository.findOne({
      where: { id: benefitId },
    });
    if (!benefit) {
      throw new NotFoundException('benefit not found');
    }
    return benefit;
  }

  async findNo() {
        const benefit = await this.findAll();
      const usedNumbers = benefit.map((b) => Number(b.no));
      
      const availableNumbers = [1, 2, 3].filter(
        (n) => !usedNumbers.includes(n)
      );
      return availableNumbers;
  }

  async update(benefitId: string, updateBenefitDto: UpdateBenefitDto) {
    const benefit = await this.findOne(benefitId);

    if (!benefit) {
      throw new NotFoundException('benefit not found');
    }

      // Cek apakah no yang diinginkan sudah dipakai data lain
  const benefit_no_used = await this.benefitRepository.findOne({
    where: { no: updateBenefitDto.no },
  });

  // Kalau sudah dipakai dan bukan data yang sama, swap nomor
  if (benefit_no_used && benefit_no_used.id !== benefitId) {
    benefit_no_used.no = benefit.no; // data lain ambil no lama
    await this.benefitRepository.save(benefit_no_used);
  }

    Object.assign(benefit, updateBenefitDto);
    return await this.benefitRepository.save(benefit);
  }

  async remove(benefitId: string) {
    const benefit = await this.findOne(benefitId);
    if (!benefit) {
      throw new NotFoundException('benefit not found');
    }
    return await this.benefitRepository.remove(benefit);
  }
}
