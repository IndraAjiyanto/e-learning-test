import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParagraphsDto } from './dto/create-paragraphs.dto';
import { UpdateParagraphsDto } from './dto/update-paragraphs.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paragraph } from 'src/entities/paragraph.entity';

@Injectable()
export class ParagraphsService {
  constructor(
    @InjectRepository(Paragraph)
    private readonly paragraphsRepository: Repository<Paragraph>,
  ) {}

  async create(createParagraphsDto: CreateParagraphsDto) {
    const paragraphs = this.paragraphsRepository.create(createParagraphsDto);
    return await this.paragraphsRepository.save(paragraphs);
  }

  async getNextOrder() {
    const paragraphsList = await this.paragraphsRepository.find({
      order: { paragraphOrder: 'DESC' },
      take: 1,
    });
    const paragraphs_old = paragraphsList[0];
    if (!paragraphs_old) {
      return 0;
    }
    return paragraphs_old.paragraphOrder + 1;
  }

  async findAll() {
    return await this.paragraphsRepository.find();
  }

  async findOne(paragraphsId: number) {
    const paragraphs = await this.paragraphsRepository.findOne({
      where: { id: paragraphsId },
    });
    if (!paragraphs) {
      throw new NotFoundException('paragraphs not found');
    }
    return paragraphs;
  }

  async update(paragraphsId: number, updateParagraphsDto: UpdateParagraphsDto) {
    const paragraphs = await this.findOne(paragraphsId);
    if (!paragraphs) {
      throw new NotFoundException('paragraphs not found');
    }
    Object.assign(paragraphs, updateParagraphsDto);
    return await this.paragraphsRepository.save(paragraphs);
  }

  async remove(paragraphsId: number) {
    const paragraphs = await this.findOne(paragraphsId);
    if (!paragraphs) {
      throw new NotFoundException('paragraphs not found');
    }
    await this.paragraphsRepository.remove(paragraphs);

    const allParagraphs = await this.paragraphsRepository.find();
    for (const item of allParagraphs) {
      if (item.paragraphOrder > paragraphs.paragraphOrder) {
        item.paragraphOrder -= 1;
        await this.paragraphsRepository.save(item);
      }
    }
  }
}
