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
    private readonly pertanyaanUmumRepository: Repository<CategoryFaq>,
  ) {}

  async create(createPertanyaanUmumDto: CreateFaqsDto) {
    const { categoryId, ...data } = createPertanyaanUmumDto;
    const category = await this.pertanyaanUmumRepository.manager.findOne(
      Category,
      { where: { id: categoryId } },
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const pertanyaanUmum = this.pertanyaanUmumRepository.create({
      ...data,
      category: category,
    });
    return await this.pertanyaanUmumRepository.save(pertanyaanUmum);
  }

  async findAll() {
    return await this.pertanyaanUmumRepository.find({
      relations: ['category'],
    });
  }

  async findOne(faqsId: number) {
    return await this.pertanyaanUmumRepository.findOne({
      where: { id: faqsId },
      relations: ['category'],
    });
  }

  async update(
    faqsId: number,
    updatePertanyaanUmumDto: UpdateFaqsDto,
  ) {
    const faqs = await this.findOne(faqsId);
    if (!faqs) {
      throw new NotFoundException('FAQ Not Found');
    }
    const { categoryId, ...data } = updatePertanyaanUmumDto;
    if (categoryId) {
      const category = await this.pertanyaanUmumRepository.manager.findOne(
        Category,
        { where: { id: categoryId } },
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      faqs.category = category;
    }
    Object.assign(faqs, data);
    return await this.pertanyaanUmumRepository.save(faqs);
  }

  async remove(faqsId: number) {
    const faqs = await this.findOne(faqsId);
    if (!faqs) {
      throw new NotFoundException('FAQ Not Found');
    }
    return await this.pertanyaanUmumRepository.remove(faqs);
  }

  async getKategori() {
    return await this.pertanyaanUmumRepository.manager.find(Category);
  }
}
