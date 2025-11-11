import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Award } from '../entities/award.entity';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';

@Injectable()
export class AwardService {
  constructor(
    @InjectRepository(Award)
    private awardRepository: Repository<Award>,
  ) {}

  async create(createAwardDto: CreateAwardDto): Promise<Award> {
    const award = this.awardRepository.create(createAwardDto);
    return this.awardRepository.save(award);
  }

  async findAll(): Promise<Award[]> {
    return this.awardRepository.find();
  }

  async findOne(id: number): Promise<Award | null> {
    return this.awardRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateAwardDto: UpdateAwardDto,
  ): Promise<Award | null> {
    await this.awardRepository.update(id, updateAwardDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.awardRepository.delete(id);
  }
}
