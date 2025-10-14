import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { VisiMisiService } from './visi_misi.service';
import { CreateVisiMisiDto } from './dto/create-visi_misi.dto';
import { UpdateVisiMisiDto } from './dto/update-visi_misi.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('visi-misi')
export class VisiMisiController {
  constructor(private readonly visiMisiService: VisiMisiService) {}

  @Roles('super_admin')
  @Post()
  async create(@Body() createVisiMisiDto: CreateVisiMisiDto, @Res() res:Response, @Req() req:Request) {
    try {
      await this.visiMisiService.create(createVisiMisiDto)
      req.flash('success','visi misi successfully craeted')
      res.redirect('/visi-misi')
    } catch (error) {
      req.flash('error','visi misi failed to create')
      res.redirect('/visi-misi')
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res:Response, @Req() req:Request) {
    const visi_misi = await this.visiMisiService.findAll()
    res.render('super_admin/visi_misi/index', {user: req.user, visi_misi})
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res:Response, @Req() req:Request){
    res.render('super_admin/visi_misi/create', {user:req.user})
  }

  @Roles('super_admin')
  @Get(':visi_misiId')
  async findOne(@Param('visi_misiId') visi_misiId: number, @Res() res:Response, @Req() req:Request) {
    const visi_misi = await this.visiMisiService.findOne(visi_misiId)
    res.render('super_admin/visi_misi/edit', {user:req.user, visi_misi})
  }

  @Roles('super_admin')
  @Patch(':visi_misiId')
  async update(@Param('visi_misiId') visi_misiId: number, @Res() res:Response, @Req() req:Request, @Body() updateVisiMisiDto: UpdateVisiMisiDto) {
    try {
      await this.visiMisiService.update(visi_misiId, updateVisiMisiDto)
      req.flash('success', 'visi misi successfully updated')
      res.redirect('/visi-misi')
    } catch (error) {
            req.flash('error', 'visi misi failed to update')
      res.redirect('/visi-misi')
    }
  }

  @Roles('super_admin')
  @Delete(':visi_misiId')
  async remove(@Param('visi_misiId') visi_misiId: number, @Res() res:Response, @Req() req:Request) {
    try {
      await this.visiMisiService.remove(visi_misiId)
      req.flash('success','visi misi successfully remove')
      res.redirect('/visi-misi')
    } catch (error) {
            req.flash('error','visi misi failed to remove')
      res.redirect('/visi-misi')
    }
  }
}

