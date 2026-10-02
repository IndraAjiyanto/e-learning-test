import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from 'src/entities/faq.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto) {
    const faq = this.faqRepository.create({ ...createFaqDto });
    return await this.faqRepository.save(faq);
  }

  async findAll() {
    // Urutan harus eksplisit: tanpa ini Postgres mengembalikan baris sesuai
    // urutan fisiknya, dan sebuah UPDATE memindahkan baris yang diedit ke
    // belakang — daftar teracak dan nomor barisnya ikut berubah (lihat TC-045).
    return await this.faqRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    return faq;
  }

  async update(id: string, updateFaqDto: UpdateFaqDto) {
    const faq = await this.findOne(id);
    Object.assign(faq, updateFaqDto);
    return await this.faqRepository.save(faq);
  }

  async remove(id: string) {
    const faq = await this.findOne(id);
    return await this.faqRepository.remove(faq);
  }
}
