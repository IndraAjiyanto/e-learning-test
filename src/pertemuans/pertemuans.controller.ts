import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PertemuansService } from './pertemuans.service';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';

@Controller('pertemuans')
export class PertemuansController {
  constructor(private readonly pertemuansService: PertemuansService) {}

  @Post()
  create(@Body() createPertemuanDto: CreatePertemuanDto) {
    return this.pertemuansService.create(createPertemuanDto);
  }

  @Get()
  findAll() {
    return this.pertemuansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pertemuansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePertemuanDto: UpdatePertemuanDto) {
    return this.pertemuansService.update(+id, updatePertemuanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pertemuansService.remove(+id);
  }
}
