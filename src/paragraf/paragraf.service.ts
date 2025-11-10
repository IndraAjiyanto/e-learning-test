import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParagrafDto } from './dto/create-paragraf.dto';
import { UpdateParagrafDto } from './dto/update-paragraf.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paragraf } from 'src/entities/paragraf.entity';

@Injectable()
export class ParagrafService {
  constructor(
    @InjectRepository(Paragraf)
    private readonly paragrafRepository: Repository<Paragraf>,
  ) {}

  async create(createParagrafDto: CreateParagrafDto) {
    const paragraf = this.paragrafRepository.create(createParagrafDto);
    return await this.paragrafRepository.save(paragraf);
  }

  async noPertemuan(){
    const paragraf_old = await this.paragrafRepository.findOne({ order: { p_ke: 'DESC' } });
    if(!paragraf_old){
      return 0
    }
    const paragraf_new = paragraf_old.p_ke + 1
    return paragraf_new
  }

  async findAll() {
    return await this.paragrafRepository.find();
  }

  async findOne(paragrafId: number) {
    const paragraf = await this.paragrafRepository.findOne({ where: { id: paragrafId } });
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
      if (item.p_ke > paragraf.p_ke) {
        item.p_ke -= 1;
        await this.paragrafRepository.save(item);
      }
    }
  }
}
