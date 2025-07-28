import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KelassService } from './kelass.service';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';

@Controller('kelass')
export class KelassController {
  constructor(private readonly kelassService: KelassService) {}

  @Post()
  create(@Body() createKelassDto: CreateKelassDto) {
    return this.kelassService.create(createKelassDto);
  }

  @Get()
  findAll() {
    return this.kelassService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kelassService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKelassDto: UpdateKelassDto) {
    return this.kelassService.update(+id, updateKelassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kelassService.remove(+id);
  }
}
