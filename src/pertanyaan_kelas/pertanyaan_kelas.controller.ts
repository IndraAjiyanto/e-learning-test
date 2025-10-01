import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PertanyaanKelasService } from './pertanyaan_kelas.service';
import { CreatePertanyaanKelaDto } from './dto/create-pertanyaan_kela.dto';
import { UpdatePertanyaanKelaDto } from './dto/update-pertanyaan_kela.dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('pertanyaan-kelas')
export class PertanyaanKelasController {
  constructor(private readonly pertanyaanKelasService: PertanyaanKelasService) {}

  @Roles('admin', 'super_admin')
  @Post()
  create(@Body() createPertanyaanKelaDto: CreatePertanyaanKelaDto) {
    return this.pertanyaanKelasService.create(createPertanyaanKelaDto);
  }

  @Get()
  findAll() {
    return this.pertanyaanKelasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pertanyaanKelasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePertanyaanKelaDto: UpdatePertanyaanKelaDto) {
    return this.pertanyaanKelasService.update(+id, updatePertanyaanKelaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pertanyaanKelasService.remove(+id);
  }
}
