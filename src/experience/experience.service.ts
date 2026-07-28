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
    const experience =
      await this.experienceRepository.create(createExperienceDto);
    return await this.experienceRepository.save(experience);
  }

  async noExperience() {
    const experience_old = await this.experienceRepository.find({
      order: { experienceOrder: 'DESC' },
      take: 1,
    });
    if (!experience_old || experience_old.length === 0) {
      return 0;
    }
    const experience_new = experience_old[0].experienceOrder + 1;
    return experience_new;
  }

  async findAll(): Promise<Experience[]> {
    return await this.experienceRepository.find();
  }

  async findOne(id: number): Promise<Experience | null> {
    return await this.experienceRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateExperienceDto: UpdateExperienceDto,
  ): Promise<Experience | null> {
    await this.experienceRepository.update(id, updateExperienceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const experience = await this.findOne(id);
    if (!experience) {
      throw new Error('Experience not found');
    }
    await this.experienceRepository.remove(experience);
    const allExperience = await this.experienceRepository.find();
    for (const item of allExperience) {
      if (item.experienceOrder > experience.experienceOrder) {
        item.experienceOrder -= 1;
        await this.experienceRepository.save(item);
      }
    }
  }
}
