import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { PertanyaanUmumService } from './pertanyaan_umum.service';
import { CreatePertanyaanUmumDto } from './dto/create-pertanyaan_umum.dto';
import { UpdatePertanyaanUmumDto } from './dto/update-pertanyaan_umum.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('pertanyaan-umum')
export class PertanyaanUmumController {
  constructor(private readonly pertanyaanUmumService: PertanyaanUmumService) {}

  @Roles('super_admin')
  @Post()
  async create(@Body() createPertanyaanUmumDto: CreatePertanyaanUmumDto, @Res() res:Response, @Req() req:Request) {
    try {
    await this.pertanyaanUmumService.create(createPertanyaanUmumDto);
    req.flash('success', 'question successfully created')
    res.redirect('/pertanyaan-umum')
    } catch (error) {
          req.flash('error', 'question failed to created')
    res.redirect('/pertanyaan-umum')
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Req() req:Request, @Res() res:Response) {
    const pertanyaan_umum = await this.pertanyaanUmumService.findAll();
    res.render('super_admin/pertanyaan_umum/index', {user: req.user, pertanyaan_umum})
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate( @Req() req:Request, @Res() res:Response) {
    res.render('super_admin/pertanyaan_umum/create', {user: req.user})
  }

  @Roles('super_admin')
  @Get('formEdit/:pertanyaan_umumId')
  async formEdit(@Param('pertanyaan_umumId') pertanyaan_umumId: number, @Req() req:Request, @Res() res:Response) {
    const pertanyaan_umum = await this.pertanyaanUmumService.findOne(pertanyaan_umumId);
    res.render('super_admin/pertanyaan_umum/edit', {user: req.user, pertanyaan_umum})
  }

  @Roles('super_admin')
  @Patch(':pertanyaan_umumId')
  async update(@Param('pertanyaan_umumId') pertanyaan_umumId: number, @Body() updatePertanyaanUmumDto: UpdatePertanyaanUmumDto, @Req() req:Request, @Res() res:Response) {
    try {
    await this.pertanyaanUmumService.update(+pertanyaan_umumId, updatePertanyaanUmumDto);
    req.flash('success', 'question successfully updated')
    res.redirect('/pertanyaan-umum')
    } catch (error) {
          req.flash('error', 'question failed to update')
    res.redirect('/pertanyaan-umum')
    }
  }

  @Roles('super_admin')
  @Delete(':pertanyaan_umumId')
  async remove(@Param('pertanyaan_umumId') pertanyaan_umumId: number, @Req() req:Request, @Res() res:Response) {
    try {
    await this.pertanyaanUmumService.remove(pertanyaan_umumId);
      req.flash('success', 'question successfully delete')
      res.redirect('/pertanyaan-umum')
    } catch (error) {
            req.flash('error', 'question failed to delete')
      res.redirect('/pertanyaan-umum')
    }
  }
}
