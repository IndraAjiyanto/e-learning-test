import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlowCategory } from '../entities/flow_category.entity';
import { CreateFlowCategoryDto } from './dto/create-flow_category.dto';
import { UpdateFlowCategoryDto } from './dto/update-flow_category.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class FlowCategoryService {
  constructor(
    @InjectRepository(FlowCategory)
    private flowCategoryRepository: Repository<FlowCategory>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createFlowCategoryDto: CreateFlowCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: createFlowCategoryDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const flowCategory = this.flowCategoryRepository.create({
      ...createFlowCategoryDto,
      category: category,
    });
    return this.flowCategoryRepository.save(flowCategory);
  }

  async findAll() {
    return this.flowCategoryRepository.find({
      relations: ['category'],
    });
  }

  async findOne(id: number) {
    const flowCategory = await this.flowCategoryRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!flowCategory) {
      throw new NotFoundException('FlowCategory not found');
    }
    return flowCategory;
  }

  async update(id: number, updateFlowCategoryDto: UpdateFlowCategoryDto) {
    const flowCategory = await this.findOne(id);
    if (updateFlowCategoryDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateFlowCategoryDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      flowCategory.category = category;
    }
    Object.assign(flowCategory, updateFlowCategoryDto);
    return this.flowCategoryRepository.save(flowCategory);
  }

  async remove(id: number) {
    const flowCategory = await this.findOne(id);
    return this.flowCategoryRepository.remove(flowCategory);
  }
}
