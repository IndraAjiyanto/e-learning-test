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
    const award = await this.awardRepository.create(createAwardDto);
    return await this.awardRepository.save(award);
  }

  async noAward() {
    const award_old = await this.awardRepository.find({
      order: { award_ke: 'DESC' },
      take: 1,
    });
    if (!award_old || award_old.length === 0) {
      return 0;
    }
    const award_new = award_old[0].award_ke + 1;
    return award_new;
  }

  async findAll(): Promise<Award[]> {
    return await this.awardRepository.find();
  }

  async findOne(id: number): Promise<Award | null> {
    return await this.awardRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateAwardDto: UpdateAwardDto,
  ): Promise<Award | null> {
    await this.awardRepository.update(id, updateAwardDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const award = await this.findOne(id);
    if (!award) {
      throw new Error('Award not found');
    }
    await this.awardRepository.remove(award);
    const allAward = await this.awardRepository.find();
    for (const item of allAward) {
      if (item.award_ke > award.award_ke) {
        item.award_ke -= 1;
        await this.awardRepository.save(item);
      }
    }
  }
}
