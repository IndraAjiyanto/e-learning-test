import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JawabanTugassService } from './jawaban_tugass.service';
import { CreateJawabanTugassDto } from './dto/create-jawaban_tugass.dto';
import { UpdateJawabanTugassDto } from './dto/update-jawaban_tugass.dto';

@Controller('jawaban-tugass')
export class JawabanTugassController {
  constructor(private readonly jawabanTugassService: JawabanTugassService) {}

  @Post()
  create(@Body() createJawabanTugassDto: CreateJawabanTugassDto) {
    return this.jawabanTugassService.create(createJawabanTugassDto);
  }

  @Get()
  findAll() {
    return this.jawabanTugassService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jawabanTugassService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJawabanTugassDto: UpdateJawabanTugassDto) {
    return this.jawabanTugassService.update(+id, updateJawabanTugassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jawabanTugassService.remove(+id);
  }
}
