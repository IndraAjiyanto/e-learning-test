import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryPartnerDto } from './dto/create-category_partner.dto';
import { UpdateCategoryPartnerDto } from './dto/update-category_partner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryPartner } from 'src/entities/category_partner.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryPartnerService {
  constructor(
    @InjectRepository(CategoryPartner)
    private readonly categoryPartnerRepository: Repository<CategoryPartner>,
  ) {}
  async create(createCategoryPartnerDto: CreateCategoryPartnerDto) {
    const data = this.categoryPartnerRepository.create({
      ...createCategoryPartnerDto,
    });
    return await this.categoryPartnerRepository.save(data);
  }

  async findAll() {
    return await this.categoryPartnerRepository.find({
      relations: ['partners'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const data = await this.categoryPartnerRepository.findOne({
      where: { id },
      relations: ['partners'],
    });
    if (!data) {
      throw new NotFoundException('categoryPartner Not Found');
    }
    return data;
  }

  async update(id: number, updateCategoryPartnerDto: UpdateCategoryPartnerDto) {
    const data = await this.findOne(id);
    Object.assign(data, updateCategoryPartnerDto);
    return await this.categoryPartnerRepository.save(data);
  }

  async remove(id: number) {
    const data = await this.findOne(id);
    return await this.categoryPartnerRepository.remove(data);
  }
}
