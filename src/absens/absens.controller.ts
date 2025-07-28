import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AbsensService } from './absens.service';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { UpdateAbsenDto } from './dto/update-absen.dto';

@Controller('absens')
export class AbsensController {
  constructor(private readonly absensService: AbsensService) {}

  @Post()
  create(@Body() createAbsenDto: CreateAbsenDto) {
    return this.absensService.create(createAbsenDto);
  }

  @Get()
  findAll() {
    return this.absensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.absensService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAbsenDto: UpdateAbsenDto) {
    return this.absensService.update(+id, updateAbsenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.absensService.remove(+id);
  }
}
