import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParagrafService } from './paragraf.service';
import { CreateParagrafDto } from './dto/create-paragraf.dto';
import { UpdateParagrafDto } from './dto/update-paragraf.dto';

@Controller('paragraf')
export class ParagrafController {
  constructor(private readonly paragrafService: ParagrafService) {}

  @Post()
  create(@Body() createParagrafDto: CreateParagrafDto) {
    return this.paragrafService.create(createParagrafDto);
  }

  @Get()
  findAll() {
    return this.paragrafService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paragrafService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParagrafDto: UpdateParagrafDto) {
    return this.paragrafService.update(+id, updateParagrafDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paragrafService.remove(+id);
  }
}
