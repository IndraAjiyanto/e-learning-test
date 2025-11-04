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
    createPertanyaanKelaDto.kelasId = kelasId;
    await this.pertanyaanKelasService.create(createPertanyaanKelaDto);
    req.flash('success', 'PertanyaanKelas created successfully');
    res.redirect('/admin/kelas/' + kelasId);
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
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePertanyaanKelaDto: UpdatePertanyaanKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const pertanyaanKelas = await this.pertanyaanKelasService.findOne(id);
    await this.pertanyaanKelasService.update(+id, updatePertanyaanKelaDto);
    req.flash('success', 'PertanyaanKelas updated successfully');
    res.redirect('/admin/kelas/' + pertanyaanKelas.kelas.id);
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const pertanyaanKelas = await this.pertanyaanKelasService.findOne(id);
    const kelasId = pertanyaanKelas.kelas.id;
    await this.pertanyaanKelasService.remove(+id);
    req.flash('success', 'PertanyaanKelas deleted successfully');
    res.redirect('/admin/kelas/' + kelasId);
  }
}
