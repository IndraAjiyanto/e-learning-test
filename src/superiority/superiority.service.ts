import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Superiority } from '../entities/superiority.entity';
import { CreateSuperiorityDto } from './dto/create-superiority.dto';
import { UpdateSuperiorityDto } from './dto/update-superiority.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class SuperiorityService {
  constructor(
    @InjectRepository(Superiority)
    private superiorityRepository: Repository<Superiority>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createSuperiorityDto: CreateSuperiorityDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: createSuperiorityDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const superiority = await this.superiorityRepository.create({
      ...createSuperiorityDto,
      category: category,
    });
    return await this.superiorityRepository.save(superiority);
  }

  async findOne(id: number) {
    const superiority = await this.superiorityRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!superiority) {
      throw new NotFoundException('Superiority not found');
    }
    return superiority;
  }

  async update(id: number, updateSuperiorityDto: UpdateSuperiorityDto) {
    const superiority = await this.findOne(id);
    if (updateSuperiorityDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateSuperiorityDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      superiority.category = category;
    }
    Object.assign(superiority, updateSuperiorityDto);
    return await this.superiorityRepository.save(superiority);
  }

  async remove(id: number) {
    const superiority = await this.findOne(id);
    return await this.superiorityRepository.remove(superiority);
  }
}
