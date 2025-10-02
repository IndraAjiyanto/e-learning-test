import { Injectable } from '@nestjs/common';
import { CreateBenefitKelaDto } from './dto/create-benefit_kela.dto';
import { UpdateBenefitKelaDto } from './dto/update-benefit_kela.dto';

@Injectable()
export class BenefitKelasService {
  create(createBenefitKelaDto: CreateBenefitKelaDto) {
    return 'This action adds a new benefitKela';
  }

  findAll() {
    return `This action returns all benefitKelas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} benefitKela`;
  }

  update(id: number, updateBenefitKelaDto: UpdateBenefitKelaDto) {
    return `This action updates a #${id} benefitKela`;
  }

  remove(id: number) {
    return `This action removes a #${id} benefitKela`;
  }
}
