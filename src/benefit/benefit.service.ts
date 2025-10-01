import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Benefit } from 'src/entities/benefit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BenefitService {
      constructor(
        @InjectRepository(Benefit)
        private readonly benefitRepository: Repository<Benefit>
      ) {}

  async create(createBenefitDto: CreateBenefitDto) {
        const benefit = await this.benefitRepository.create(createBenefitDto)
    return await this.benefitRepository.save(benefit)
  }

  async findAll() {
    return await this.benefitRepository.find()
  }

  async findOne(benefitId: number) {
    const benefit = await this.benefitRepository.findOne({where: {id: benefitId}})
    if(!benefit){
      throw new NotFoundException('benefit not found')
    }
    return benefit
  }

  async update(benefitId: number, updateBenefitDto: UpdateBenefitDto) {
             const benefit = await this.findOne(benefitId)
        if(!benefit){
                  throw new NotFoundException('benefit not found');
        }
        Object.assign(benefit, updateBenefitDto)
        return await this.benefitRepository.save(benefit)
  }

  async remove(benefitId: number) {
            const benefit = await this.findOne(benefitId)
    if(!benefit){
      throw new NotFoundException('benefit not found')
    }
    return await this.benefitRepository.remove(benefit)
  }
}
