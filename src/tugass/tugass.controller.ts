import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TugassService } from './tugass.service';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';

@Controller('tugass')
export class TugassController {
  constructor(private readonly tugassService: TugassService) {}

  @Post()
  create(@Body() createTugassDto: CreateTugassDto) {
    return this.tugassService.create(createTugassDto);
  }

  @Get()
  findAll() {
    return this.tugassService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tugassService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTugassDto: UpdateTugassDto) {
    return this.tugassService.update(+id, updateTugassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tugassService.remove(+id);
  }
}
