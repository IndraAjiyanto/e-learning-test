import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PertanyaansService } from './pertanyaans.service';
import { CreatePertanyaanDto } from './dto/create-pertanyaan.dto';
import { UpdatePertanyaanDto } from './dto/update-pertanyaan.dto';

@Controller('pertanyaans')
export class PertanyaansController {
  constructor(private readonly pertanyaansService: PertanyaansService) {}

  @Post()
  create(@Body() createPertanyaanDto: CreatePertanyaanDto) {
    return this.pertanyaansService.create(createPertanyaanDto);
  }

  @Get()
  findAll() {
    return this.pertanyaansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pertanyaansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePertanyaanDto: UpdatePertanyaanDto) {
    return this.pertanyaansService.update(+id, updatePertanyaanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pertanyaansService.remove(+id);
  }
}
