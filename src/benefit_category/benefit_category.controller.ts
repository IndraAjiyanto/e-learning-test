import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BenefitCategoryService } from './benefit_category.service';
import { CreateBenefitCategoryDto } from './dto/create-benefit_category.dto';
import { UpdateBenefitCategoryDto } from './dto/update-benefit_category.dto';

@Controller('benefit-category')
export class BenefitCategoryController {
  constructor(private readonly benefitCategoryService: BenefitCategoryService) {}

  @Post()
  create(@Body() createBenefitCategoryDto: CreateBenefitCategoryDto) {
    return this.benefitCategoryService.create(createBenefitCategoryDto);
  }

  @Get()
  findAll() {
    return this.benefitCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.benefitCategoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBenefitCategoryDto: UpdateBenefitCategoryDto) {
    return this.benefitCategoryService.update(+id, updateBenefitCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.benefitCategoryService.remove(+id);
  }
}
