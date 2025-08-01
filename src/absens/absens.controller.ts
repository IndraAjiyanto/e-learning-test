import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AbsensService } from './absens.service';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { UpdateAbsenDto } from './dto/update-absen.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthenticatedGuard)
@Controller('absens')
export class AbsensController {
  constructor(private readonly absensService: AbsensService) {}

  @Roles('user')
  @Post()
  create(@Body() createAbsenDto: CreateAbsenDto) {
    return this.absensService.create(createAbsenDto);
  }

  @Roles('user')
  @Get()
  findAll() {
    return this.absensService.findAll();
  }

  @Roles('user')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.absensService.findOne(+id);
  }

  @Roles('user')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAbsenDto: UpdateAbsenDto) {
    return this.absensService.update(+id, updateAbsenDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.absensService.remove(+id);
  }
}
