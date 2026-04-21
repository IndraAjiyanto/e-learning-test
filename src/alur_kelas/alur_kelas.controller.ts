import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { AlurKelasService } from './alur_kelas.service';
import { CreateAlurKelaDto } from './dto/create-alur_kela.dto';
import { UpdateAlurKelaDto } from './dto/update-alur_kela.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('flow-program')
export class AlurKelasController {
  constructor(private readonly alurKelasService: AlurKelasService) {}

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const alur_kelas = await this.alurKelasService.findAll();
    res.render('super_admin/alur_kelas/index', { user: req.user, alur_kelas });
  }

  @Roles('super_admin')
  @Get('detail/:alurKelasId')
  async findOneDetail(
    @Param('alurKelasId') alurKelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const alur_kelas = await this.alurKelasService.findOne(alurKelasId);
    res.render('super_admin/alur_kelas/detail', { user: req.user, alur_kelas });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const kelas = await this.alurKelasService.findAllKelas();
    res.render('super_admin/alur_kelas/create', { user: req.user, kelas });
  }

  @Roles('super_admin')
  @Post()
  async createFromIndex(
    @Body() createAlurKelaDto: CreateAlurKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kelasId = Number(req.body.kelas_id);
      createAlurKelaDto.kelasId = kelasId;
      await this.alurKelasService.create(createAlurKelaDto);
      req.flash('success', 'Flow Program successfully created');
      res.redirect(`/flow-program`);
    } catch (error) {
      req.flash('error', error.message || 'Flow Program failed to create');
      res.redirect(`/flow-program`);
    }
  }

  @Roles('super_admin')
  @Post(':kelasId')
  async create(
    @Param('kelasId') kelasId: number,
    @Body() createAlurKelaDto: CreateAlurKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createAlurKelaDto.kelasId = kelasId;
      await this.alurKelasService.create(createAlurKelaDto);
      req.flash('success', 'alur kelas successfully created');
      res.redirect(`/program/detail/program/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'alur kelas failed to create');
      res.redirect(`/program/detail/program/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:kelasId')
  async formCreateWithKelas(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('super_admin/alur_kelas/create', { user: req.user, kelasId });
  }

  @Roles('super_admin')
  @Get('formEdit/:alurKelasId')
  async formEdit(
    @Param('alurKelasId') alurKelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const alur_kelas = await this.alurKelasService.findOne(alurKelasId);
    res.render('super_admin/alur_kelas/edit', { user: req.user, alur_kelas });
  }

  @Roles('super_admin')
  @Patch(':alurKelasId/:kelasId')
  async update(
    @Param('alurKelasId') alurKelasId: number,
    @Param('kelasId') kelasId: number,
    @Body() updateAlurKelaDto: UpdateAlurKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.alurKelasService.update(alurKelasId, updateAlurKelaDto);
      req.flash('success', 'Flow Program successfully updated');
      res.redirect(`/program/detail/program/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Flow Program failed to update');
      res.redirect(`/program/detail/program/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Delete(':alurKelasId/:kelasId')
  async remove(
    @Param('alurKelasId') alurKelasId: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.alurKelasService.remove(alurKelasId, kelasId);
      req.flash('success', 'Flow Program successfully deleted');
      res.redirect(`/program/detail/program/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Flow Program failed to delete');
      res.redirect(`/program/detail/program/admin/${kelasId}`);
    }
  }
}
