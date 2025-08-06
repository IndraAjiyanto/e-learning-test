import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PertemuansService } from './pertemuans.service';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthenticatedGuard)
@Controller('pertemuans')
export class PertemuansController {
  constructor(private readonly pertemuansService: PertemuansService) {}

  @Roles('admin')
  @Post()
  create(@Body() createPertemuanDto: CreatePertemuanDto) {
    return this.pertemuansService.create(createPertemuanDto);
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.pertemuansService.findAll();
  }

  @Roles('user', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pertemuansService.findOne(+id);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePertemuanDto: UpdatePertemuanDto) {
    return this.pertemuansService.update(+id, updatePertemuanDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pertemuansService.remove(+id);
  }
}
