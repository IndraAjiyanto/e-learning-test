import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParagrafDto } from './dto/create-paragraf.dto';
import { UpdateParagrafDto } from './dto/update-paragraf.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paragraph } from 'src/entities/paragraph.entity';

@Injectable()
export class ParagrafService {
  constructor(
    @InjectRepository(Paragraph)
    private readonly paragrafRepository: Repository<Paragraph>,
  ) {}

  async create(createParagrafDto: CreateParagrafDto) {
    const paragraf = this.paragrafRepository.create(createParagrafDto);
    return await this.paragrafRepository.save(paragraf);
  }

  async noPertemuan() {
    const paragrafList = await this.paragrafRepository.find({
      order: { paragraphOrder: 'DESC' },
      take: 1,
    });
    const paragraf_old = paragrafList[0];
    if (!paragraf_old) {
      return 0;
    }
    return paragraf_old.paragraphOrder + 1;
  }

  async findAll() {
    return await this.paragrafRepository.find();
  }

  async findOne(paragrafId: number) {
    const paragraf = await this.paragrafRepository.findOne({
      where: { id: paragrafId },
    });
    if (!paragraf) {
      throw new NotFoundException('paragraf not found');
    }
    return paragraf;
  }

  async update(paragrafId: number, updateParagrafDto: UpdateParagrafDto) {
    const paragraf = await this.findOne(paragrafId);
    if (!paragraf) {
      throw new NotFoundException('paragraf not found');
    }
    Object.assign(paragraf, updateParagrafDto);
    return await this.paragrafRepository.save(paragraf);
  }

  async remove(paragrafId: number) {
    const paragraf = await this.findOne(paragrafId);
    if (!paragraf) {
      throw new NotFoundException('paragraf not found');
    }
    await this.paragrafRepository.remove(paragraf);

    const allParagraf = await this.paragrafRepository.find();
    for (const item of allParagraf) {
      if (item.paragraphOrder > paragraf.paragraphOrder) {
        item.paragraphOrder -= 1;
        await this.paragrafRepository.save(item);
      }
    }
  }
}
