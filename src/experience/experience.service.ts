import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from '../entities/experience.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
  ) {}

  async create(createExperienceDto: CreateExperienceDto): Promise<Experience> {
    const experience = this.experienceRepository.create(createExperienceDto);
    return this.experienceRepository.save(experience);
  }

  async findAll(): Promise<Experience[]> {
    return this.experienceRepository.find();
  }

  async findOne(id: number): Promise<Experience | null> {
    return this.experienceRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateExperienceDto: UpdateExperienceDto,
  ): Promise<Experience | null> {
    await this.experienceRepository.update(id, updateExperienceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.experienceRepository.delete(id);
  }
}
