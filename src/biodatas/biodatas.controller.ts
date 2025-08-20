import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BiodatasService } from './biodatas.service';
import { CreateBiodataDto } from './dto/create-biodata.dto';
import { UpdateBiodataDto } from './dto/update-biodata.dto';

@Controller('biodatas')
export class BiodatasController {
  constructor(private readonly biodatasService: BiodatasService) {}

  @Post()
  create(@Body() createBiodataDto: CreateBiodataDto) {
    return this.biodatasService.create(createBiodataDto);
  }

  @Get()
  findAll() {
    return this.biodatasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.biodatasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBiodataDto: UpdateBiodataDto) {
    return this.biodatasService.update(+id, updateBiodataDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.biodatasService.remove(+id);
  }
}
