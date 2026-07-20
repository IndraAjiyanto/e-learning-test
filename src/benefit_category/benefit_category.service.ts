import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BenefitCategory } from '../entities/benefit_category.entity';
import { CreateBenefitCategoryDto } from './dto/create-benefit_category.dto';
import { UpdateBenefitCategoryDto } from './dto/update-benefit_category.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class BenefitCategoryService {
  constructor(
    @InjectRepository(BenefitCategory)
    private benefitCategoryRepository: Repository<BenefitCategory>,
    @InjectRepository(Category)
    private kategoriRepository: Repository<Category>,
  ) {}

  async create(createBenefitCategoryDto: CreateBenefitCategoryDto) {
    const category = await this.kategoriRepository.findOne({
      where: { id: createBenefitCategoryDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const benefitCategory = await this.benefitCategoryRepository.create({
      ...createBenefitCategoryDto,
      category: category,
    });
    return await this.benefitCategoryRepository.save(benefitCategory);
  }

  async findOne(id: number) {
    const benefitCategory = await this.benefitCategoryRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!benefitCategory) {
      throw new NotFoundException('BenefitCategory not found');
    }
    return benefitCategory;
  }

  async update(id: number, updateBenefitCategoryDto: UpdateBenefitCategoryDto) {
    const benefitCategory = await this.findOne(id);
    if (updateBenefitCategoryDto.categoryId) {
      const category = await this.kategoriRepository.findOne({
        where: { id: updateBenefitCategoryDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      benefitCategory.category = category;
    }
    Object.assign(benefitCategory, updateBenefitCategoryDto);
    return await this.benefitCategoryRepository.save(benefitCategory);
  }

  async remove(id: number) {
    const benefitCategory = await this.findOne(id);
    return await this.benefitCategoryRepository.remove(benefitCategory);
  }
}
