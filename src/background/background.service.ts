import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Background } from '../entities/background.entity';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';

@Injectable()
export class BackgroundService {
  constructor(
    @InjectRepository(Background)
    private backgroundRepository: Repository<Background>,
  ) {}

  async create(createBackgroundDto: CreateBackgroundDto): Promise<Background> {
    const background = await this.backgroundRepository.create(createBackgroundDto);
    return await this.backgroundRepository.save(background);
  }

  async noBackground() {
    const background_old = await this.backgroundRepository.find({
      order: { backgroundOrder: 'DESC' },
      take: 1,
    });
    if (!background_old || background_old.length === 0) {
      return 0;
    }
    const background_new = background_old[0].backgroundOrder + 1;
    return background_new;
  }

  async findAll(): Promise<Background[]> {
    return await this.backgroundRepository.find();
  }

  async findOne(id: number): Promise<Background | null> {
    return await this.backgroundRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateBackgroundDto: UpdateBackgroundDto,
  ): Promise<Background | null> {
    await this.backgroundRepository.update(id, updateBackgroundDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const background = await this.findOne(id);
    if (!background) {
      throw new Error('Background not found');
    }
    await this.backgroundRepository.remove(background);
    const allBackground = await this.backgroundRepository.find();
    for (const item of allBackground) {
      if (item.backgroundOrder > background.backgroundOrder) {
        item.backgroundOrder -= 1;
        await this.backgroundRepository.save(item);
      }
    }
  }
}
