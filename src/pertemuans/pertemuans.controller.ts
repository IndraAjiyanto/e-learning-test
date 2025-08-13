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
    createPertemuanDto.pertemuan_ke = await this.pertemuansService.noPertemuan(createPertemuanDto.kelasId)
    await this.pertemuansService.create(createPertemuanDto);
    res.redirect('pertemuans')
  }

  @Roles('admin')
  @Get()
  async findAll(@Res() res:Response, @Req() req:any) {
    const pertemuan = await this.pertemuansService.findAll();
    res.render('admin/pertemuan/index', {user: req.user, pertemuan})
  }

  @Roles('admin')
  @Get('formCreate')
  async formCreate(@Res() res:Response, @Req() req:any){
    const kelas = await this.pertemuansService.findAllKelas()
    res.render('admin/pertemuan/create', {user: req.user, kelas})
  }

  @Roles('admin')
  @Get('formEdit/:id')
  async formEdit(@Res() res:Response, @Req() req:any, @Param('id') id: number){
    const pertemuan = await this.pertemuansService.findOne(id)
    const kelas = await this.pertemuansService.findAllKelas()
    res.render('admin/pertemuan/edit', {user: req.user, kelas, pertemuan})
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res:Response, @Req() req:any) {
    const pertemuan = await this.pertemuansService.findOne(id);
    const murid = await this.pertemuansService.findMuridInKelas(pertemuan.kelas.id, id)
    res.render('admin/pertemuan/detail',{user:req.user, pertemuan, murid})
  }

  @Roles('admin')
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updatePertemuanDto: UpdatePertemuanDto, @Res() res:Response) {
    await this.pertemuansService.update(id, updatePertemuanDto);
    res.redirect('/pertemuans')
  }

  @Roles('admin')
  @Delete(':id/:kelasId')
  async remove(@Param('id') id: number,@Param('kelasId') kelasId: number, @Res() res:Response) {
    await this.pertemuansService.remove(id, kelasId);
    res.redirect('/pertemuans')
  }
}
