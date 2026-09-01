import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OurExperience } from '../entities/our_experience.entity';
import { CreateOurExperienceDto } from './dto/create-our_experience.dto';
import { UpdateOurExperienceDto } from './dto/update-our_experience.dto';

@Injectable()
export class OurExperienceService {
  constructor(
    @InjectRepository(OurExperience)
    private ourExperienceRepository: Repository<OurExperience>,
  ) {}

  async findAll() {
    return await this.ourExperienceRepository.find();
  }

  async create(createOurExperienceDto: CreateOurExperienceDto) {
    const ourExperience = await this.ourExperienceRepository.create(
      createOurExperienceDto,
    );
    return await this.ourExperienceRepository.save(ourExperience);
  }

  async findOne(id: string) {
    const ourExperience = await this.ourExperienceRepository.findOne({
      where: { id },
    });
    if (!ourExperience) {
      throw new NotFoundException('OurExperience not found');
    }
    return ourExperience;
  }

  async update(id: string, updateOurExperienceDto: UpdateOurExperienceDto) {
    const ourExperience = await this.findOne(id);
    Object.assign(ourExperience, updateOurExperienceDto);
    return await this.ourExperienceRepository.save(ourExperience);
  }

  async remove(id: string) {
    const ourExperience = await this.findOne(id);
    return await this.ourExperienceRepository.remove(ourExperience);
  }
}
