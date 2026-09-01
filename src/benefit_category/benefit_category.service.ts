import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BenefitCategory } from '../entities/benefit_category.entity';
import { CreateBenefitCategoryDto } from './dto/create-benefit_category.dto';
import { UpdateBenefitCategoryDto } from './dto/update-benefit_category.dto';
import { Kategori } from '../entities/kategori.entity';

@Injectable()
export class BenefitCategoryService {
  constructor(
    @InjectRepository(BenefitCategory)
    private benefitCategoryRepository: Repository<BenefitCategory>,
    @InjectRepository(Kategori)
    private kategoriRepository: Repository<Kategori>,
  ) {}

  async create(createBenefitCategoryDto: CreateBenefitCategoryDto) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: createBenefitCategoryDto.kategoriId },
    });
    if (!kategori) {
      throw new NotFoundException('Kategori not found');
    }
    const benefitCategory = await this.benefitCategoryRepository.create({
      ...createBenefitCategoryDto,
      kategori,
    });
    return await this.benefitCategoryRepository.save(benefitCategory);
  }

  async findOne(id: string) {
    const benefitCategory = await this.benefitCategoryRepository.findOne({
      where: { id },
      relations: ['kategori'],
    });
    if (!benefitCategory) {
      throw new NotFoundException('BenefitCategory not found');
    }
    return benefitCategory;
  }

  async update(id: string, updateBenefitCategoryDto: UpdateBenefitCategoryDto) {
    const benefitCategory = await this.findOne(id);
    if (updateBenefitCategoryDto.kategoriId) {
      const kategori = await this.kategoriRepository.findOne({
        where: { id: updateBenefitCategoryDto.kategoriId },
      });
      if (!kategori) {
        throw new NotFoundException('Kategori not found');
      }
      benefitCategory.kategori = kategori;
    }
    Object.assign(benefitCategory, updateBenefitCategoryDto);
    return await this.benefitCategoryRepository.save(benefitCategory);
  }

  async remove(id: string) {
    const benefitCategory = await this.findOne(id);
    return await this.benefitCategoryRepository.remove(benefitCategory);
  }
}
