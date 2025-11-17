import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  Render,
} from '@nestjs/common';
import { PertanyaanKelasService } from './pertanyaan_kelas.service';
import { CreatePertanyaanKelaDto } from './dto/create-pertanyaan_kela.dto';
import { UpdatePertanyaanKelaDto } from './dto/update-pertanyaan_kela.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('pertanyaan-kelas')
export class PertanyaanKelasController {
  constructor(
    private readonly pertanyaanKelasService: PertanyaanKelasService,
  ) {}

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const pertanyaanKelas = await this.pertanyaanKelasService.findAll();
    res.render('super_admin/pertanyaan_kelas/index', {
      user: req.user,
      pertanyaanKelas,
    });
  }

  @Roles('super_admin')
  @Get('formCreate/:kelasId')
  async formCreate(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelass = await this.pertanyaanKelasService.findAllKelas();
    res.render('super_admin/pertanyaan_kelas/create', {
      user: req.user,
      kelass,
      kelasId,
    });
  }

  @Roles('super_admin')
  @Post(':kelasId')
  async create(
    @Param('kelasId') kelasId: number,
    @Body() createPertanyaanKelaDto: CreatePertanyaanKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPertanyaanKelaDto.kelasId = kelasId;
      await this.pertanyaanKelasService.create(createPertanyaanKelaDto);
      req.flash('success', 'FAQ program created successfully');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'FAQ program  failed to create');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const pertanyaanKelas = await this.pertanyaanKelasService.findOne(id);
    const kelass = await this.pertanyaanKelasService.findAllKelas();
    res.render('super_admin/pertanyaan_kelas/edit', {
      user: req.user,
      pertanyaanKelas,
      kelass,
    });
  }

  @Roles('super_admin')
  @Patch(':id/:kelasId')
  async update(
    @Param('id') id: number,
    @Param('kelasId') kelasId: number,
    @Body() updatePertanyaanKelaDto: UpdatePertanyaanKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.pertanyaanKelasService.update(+id, updatePertanyaanKelaDto);
      req.flash('success', 'FAQ program updated successfully');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'FAQ program failed to update');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Delete(':id/:kelasId')
  async remove(
    @Param('id') id: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.pertanyaanKelasService.remove(+id);
      req.flash('success', 'FAQ program deleted successfully');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'FAQ program failed to delete');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }
}
