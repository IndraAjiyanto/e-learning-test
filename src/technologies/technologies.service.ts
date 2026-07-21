import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTechnologiesDto } from './dto/create-technologies.dto';
import { UpdateTechnologiesDto } from './dto/update-technologies.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Technology } from 'src/entities/technology.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TechnologiesService {
  constructor(
    @InjectRepository(Technology)
    private readonly technologiesRepository: Repository<Technology>,
  ) {}

  async create(createTechnologiesDto: CreateTechnologiesDto) {
    const technologies = this.technologiesRepository.create(createTechnologiesDto);
    return await this.technologiesRepository.save(technologies);
  }

  async findAll() {
    return await this.technologiesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const technologies = await this.technologiesRepository.findOne({
      where: { id },
    });
    if (!technologies) {
      throw new NotFoundException('Tech not found');
    }
    return technologies;
  }

  async update(id: number, updateTechnologiesDto: UpdateTechnologiesDto) {
    const technologies = await this.findOne(id);
    if (!technologies) {
      throw new NotFoundException('Tech not found');
    }

    Object.assign(technologies, updateTechnologiesDto);
    return await this.technologiesRepository.save(technologies);
  }

  async remove(id: number) {
    const technologies = await this.findOne(id);
    if (!technologies) {
      throw new NotFoundException('Tech not found');
    }
    return await this.technologiesRepository.remove(technologies);
  }
}
