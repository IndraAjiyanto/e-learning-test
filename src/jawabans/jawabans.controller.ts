import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JawabansService } from './jawabans.service';
import { CreateJawabanDto } from './dto/create-jawaban.dto';
import { UpdateJawabanDto } from './dto/update-jawaban.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@UseGuards(AuthenticatedGuard)
@Controller('jawabans')
export class JawabansController {
  constructor(private readonly jawabansService: JawabansService) {}

  @Post()
  create(@Body() createJawabanDto: CreateJawabanDto) {
    return this.jawabansService.create(createJawabanDto);
  }

  @Get()
  findAll() {
    return this.jawabansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jawabansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJawabanDto: UpdateJawabanDto) {
    return this.jawabansService.update(+id, updateJawabanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jawabansService.remove(+id);
  }
}
