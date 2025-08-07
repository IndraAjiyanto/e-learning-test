import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { PertemuansService } from './pertemuans.service';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('pertemuans')
export class PertemuansController {
  constructor(private readonly pertemuansService: PertemuansService) {}

  @Roles('admin')
  @Post()
  async create(@Body() createPertemuanDto: CreatePertemuanDto, @Res() res:Response) {
    await this.pertemuansService.create(createPertemuanDto);
    res.redirect('pertemuans')
  }

  @Roles('admin')
  @Get()
  async findAll(@Res() res:Response, @Req() req:any) {
    const pertemuan = await this.pertemuansService.findAll();
    res.render('pertemuan/index', {user: req.user, pertemuan})
  }

  @Roles('user', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pertemuansService.findOne(+id);
  }

  @Roles('admin')
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updatePertemuanDto: UpdatePertemuanDto, @Res() res:Response) {
    await this.pertemuansService.update(id, updatePertemuanDto);
    res.redirect('pertemuans')
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res:Response) {
    await this.pertemuansService.remove(id);
    res.redirect('pertemuans')

  }
}
