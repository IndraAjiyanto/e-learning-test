import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlowCategory } from '../entities/flow_category.entity';
import { CreateFlowCategoryDto } from './dto/create-flow_category.dto';
import { UpdateFlowCategoryDto } from './dto/update-flow_category.dto';
import { Kategori } from '../entities/kategori.entity';

@Injectable()
export class FlowCategoryService {
  constructor(
    @InjectRepository(FlowCategory)
    private flowCategoryRepository: Repository<FlowCategory>,
    @InjectRepository(Kategori)
    private kategoriRepository: Repository<Kategori>,
  ) {}

  async create(createFlowCategoryDto: CreateFlowCategoryDto) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: createFlowCategoryDto.kategoriId },
    });
    if (!kategori) {
      throw new NotFoundException('Kategori not found');
    }
    const flowCategory = this.flowCategoryRepository.create({
      ...createFlowCategoryDto,
      kategori,
    });
    return this.flowCategoryRepository.save(flowCategory);
  }

  async findAll() {
    return this.flowCategoryRepository.find({
      relations: ['kategori'],
    });
  }

  async findOne(id: string) {
    const flowCategory = await this.flowCategoryRepository.findOne({
      where: { id },
      relations: ['kategori'],
    });
    if (!flowCategory) {
      throw new NotFoundException('FlowCategory not found');
    }
    return flowCategory;
  }

  async update(id: string, updateFlowCategoryDto: UpdateFlowCategoryDto) {
    const flowCategory = await this.findOne(id);
    if (updateFlowCategoryDto.kategoriId) {
      const kategori = await this.kategoriRepository.findOne({
        where: { id: updateFlowCategoryDto.kategoriId },
      });
      if (!kategori) {
        throw new NotFoundException('Kategori not found');
      }
      flowCategory.kategori = kategori;
    }
    Object.assign(flowCategory, updateFlowCategoryDto);
    return this.flowCategoryRepository.save(flowCategory);
  }

  async remove(id: string) {
    const flowCategory = await this.findOne(id);
    return this.flowCategoryRepository.remove(flowCategory);
  }
}
