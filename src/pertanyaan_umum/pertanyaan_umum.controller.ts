import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { PertanyaanUmumService } from './pertanyaan_umum.service';
import { CreatePertanyaanUmumDto } from './dto/create-pertanyaan_umum.dto';
import { UpdatePertanyaanUmumDto } from './dto/update-pertanyaan_umum.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('question-general')
export class PertanyaanUmumController {
  constructor(private readonly pertanyaanUmumService: PertanyaanUmumService) {}

  @Roles('super_admin')
  @Post(':kategoriId')
  async create(
    @Param('kategoriId') kategoriId: string,
    @Body() createPertanyaanUmumDto: CreatePertanyaanUmumDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPertanyaanUmumDto.kategoriId = kategoriId;
      await this.pertanyaanUmumService.create(createPertanyaanUmumDto);
      req.flash('success', 'FAQ successfully created');
      res.redirect('/category/' + kategoriId);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to created');
      res.redirect('/category/' + kategoriId);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:kategoriId')
  async formCreate(
    @Param('kategoriId') kategoriId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('super_admin/pertanyaan_umum/create', {
      user: req.user,
      kategoriId,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:pertanyaan_umumId')
  async formEdit(
    @Param('pertanyaan_umumId') pertanyaan_umumId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const pertanyaan_umum =
      await this.pertanyaanUmumService.findOne(pertanyaan_umumId);
    res.render('super_admin/pertanyaan_umum/edit', {
      user: req.user,
      pertanyaan_umum,
    });
  }

  @Roles('super_admin')
  @Patch(':pertanyaan_umumId/:kategoriId')
  async update(
    @Param('pertanyaan_umumId') pertanyaan_umumId: string,
    @Param('kategoriId') kategoriId: string,
    @Body() updatePertanyaanUmumDto: UpdatePertanyaanUmumDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.pertanyaanUmumService.update(
        pertanyaan_umumId,
        updatePertanyaanUmumDto,
      );
      req.flash('success', 'FAQ successfully updated');
      res.redirect('/category/' + kategoriId);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to update');
      res.redirect('/category/' + kategoriId);
    }
  }

  @Roles('super_admin')
  @Delete(':pertanyaan_umumId/:kategoriId')
  async remove(
    @Param('pertanyaan_umumId') pertanyaan_umumId: string,
    @Param('kategoriId') kategoriId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.pertanyaanUmumService.remove(pertanyaan_umumId);
      req.flash('success', 'FAQ successfully deleted');
      res.redirect('/category/' + kategoriId);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to delete');
      res.redirect('/category/' + kategoriId);
    }
  }
}
