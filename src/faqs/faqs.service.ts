import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFaqsDto } from './dto/create-faqs.dto';
import { UpdateFaqsDto } from './dto/update-faqs.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryFaq } from 'src/entities/faqs.entity';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(CategoryFaq)
    private readonly faqRepository: Repository<CategoryFaq>,
  ) {}

  async create(createFaqDto: CreateFaqsDto) {
    const { categoryId, ...data } = createFaqDto;
    const category = await this.faqRepository.manager.findOne(Category, {
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const faq = this.faqRepository.create({
      ...data,
      category: category,
    });
    return await this.faqRepository.save(faq);
  }

  async findAll() {
    return await this.faqRepository.find({
      relations: ['category'],
    });
  }

  async findOne(faqsId: string) {
    return await this.faqRepository.findOne({
      where: { id: faqsId },
      relations: ['category'],
    });
  }

  async update(faqsId: string, updateFaqDto: UpdateFaqsDto) {
    const faqs = await this.findOne(faqsId);
    if (!faqs) {
      throw new NotFoundException('FAQ Not Found');
    }
    const { categoryId, ...data } = updateFaqDto;
    if (categoryId) {
      const category = await this.faqRepository.manager.findOne(Category, {
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      faqs.category = category;
    }
    Object.assign(faqs, data);
    return await this.faqRepository.save(faqs);
  }

  async remove(faqsId: string) {
    const faqs = await this.findOne(faqsId);
    if (!faqs) {
      throw new NotFoundException('FAQ Not Found');
    }
    return await this.faqRepository.remove(faqs);
  }

  async getCategory() {
    return await this.faqRepository.manager.find(Category);
  }
}
