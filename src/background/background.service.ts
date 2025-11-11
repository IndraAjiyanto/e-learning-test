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
    const background = this.backgroundRepository.create(createBackgroundDto);
    return this.backgroundRepository.save(background);
  }

  async findAll(): Promise<Background[]> {
    return this.backgroundRepository.find();
  }

  async findOne(id: number): Promise<Background | null> {
    return this.backgroundRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateBackgroundDto: UpdateBackgroundDto,
  ): Promise<Background | null> {
    await this.backgroundRepository.update(id, updateBackgroundDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.backgroundRepository.delete(id);
  }
}
