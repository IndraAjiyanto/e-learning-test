import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BenefitKelasService } from './benefit_kelas.service';
import { CreateBenefitKelaDto } from './dto/create-benefit_kela.dto';
import { UpdateBenefitKelaDto } from './dto/update-benefit_kela.dto';

@Controller('benefit-kelas')
export class BenefitKelasController {
  constructor(private readonly benefitKelasService: BenefitKelasService) {}

  @Post()
  create(@Body() createBenefitKelaDto: CreateBenefitKelaDto) {
    return this.benefitKelasService.create(createBenefitKelaDto);
  }

  @Get()
  findAll() {
    return this.benefitKelasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.benefitKelasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBenefitKelaDto: UpdateBenefitKelaDto) {
    return this.benefitKelasService.update(+id, updateBenefitKelaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.benefitKelasService.remove(+id);
  }
}
