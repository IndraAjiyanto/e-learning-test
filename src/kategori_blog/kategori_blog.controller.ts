import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KategoriBlogService } from './kategori_blog.service';
import { CreateKategoriBlogDto } from './dto/create-kategori_blog.dto';
import { UpdateKategoriBlogDto } from './dto/update-kategori_blog.dto';

@Controller('kategori-blog')
export class KategoriBlogController {
  constructor(private readonly kategoriBlogService: KategoriBlogService) {}

  @Post()
  create(@Body() createKategoriBlogDto: CreateKategoriBlogDto) {
    return this.kategoriBlogService.create(createKategoriBlogDto);
  }

  @Get()
  findAll() {
    return this.kategoriBlogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kategoriBlogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKategoriBlogDto: UpdateKategoriBlogDto) {
    return this.kategoriBlogService.update(+id, updateKategoriBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kategoriBlogService.remove(+id);
  }
}
