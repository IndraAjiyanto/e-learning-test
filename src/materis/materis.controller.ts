import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';

@Controller('materis')
export class MaterisController {
  constructor(private readonly materisService: MaterisService) {}

  @Post()
  create(@Body() createMaterisDto: CreateMaterisDto) {
    return this.materisService.create(createMaterisDto);
  }

  @Get()
  findAll() {
    return this.materisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaterisDto: UpdateMaterisDto) {
    return this.materisService.update(+id, updateMaterisDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materisService.remove(+id);
  }
}
