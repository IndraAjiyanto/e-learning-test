import { Injectable } from '@nestjs/common';
import { CreateBenefitCategoryDto } from './dto/create-benefit_category.dto';
import { UpdateBenefitCategoryDto } from './dto/update-benefit_category.dto';

@Injectable()
export class BenefitCategoryService {
  create(createBenefitCategoryDto: CreateBenefitCategoryDto) {
    return 'This action adds a new benefitCategory';
  }

  findAll() {
    return `This action returns all benefitCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} benefitCategory`;
  }

  update(id: number, updateBenefitCategoryDto: UpdateBenefitCategoryDto) {
    return `This action updates a #${id} benefitCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} benefitCategory`;
  }
}
