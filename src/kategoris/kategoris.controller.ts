import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';

@Controller('kategoris')
export class KategorisController {
  constructor(private readonly kategorisService: KategorisService) {}

  @Post()
  create(@Body() createKategorisDto: CreateKategorisDto) {
    return this.kategorisService.create(createKategorisDto);
  }

  @Get()
  findAll() {
    return this.kategorisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kategorisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKategorisDto: UpdateKategorisDto) {
    return this.kategorisService.update(+id, updateKategorisDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kategorisService.remove(+id);
  }
}
