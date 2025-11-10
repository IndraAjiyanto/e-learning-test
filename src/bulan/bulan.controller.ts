import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BulanService } from './bulan.service';
import { CreateBulanDto } from './dto/create-bulan.dto';
import { UpdateBulanDto } from './dto/update-bulan.dto';

@Controller('bulan')
export class BulanController {
  constructor(private readonly bulanService: BulanService) {}

  @Post()
  create(@Body() createBulanDto: CreateBulanDto) {
    return this.bulanService.create(createBulanDto);
  }

  @Get()
  findAll() {
    return this.bulanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bulanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBulanDto: UpdateBulanDto) {
    return this.bulanService.update(+id, updateBulanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bulanService.remove(+id);
  }
}
