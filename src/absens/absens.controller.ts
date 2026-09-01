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
import { AbsensService } from './absens.service';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { UpdateAbsenDto } from './dto/update-absen.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('attendance')
export class AbsensController {
  constructor(private readonly absensService: AbsensService) {}

  @Roles('user')
  @Post(':pertemuanId/:userId/:kelasId')
  async create(
    @Param('pertemuanId') pertemuanId: string,
    @Param('kelasId') kelasId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
    @Body() createAbsenDto: CreateAbsenDto,
    @Req() req: Request,
  ) {
    try {
      createAbsenDto.pertemuanId = pertemuanId;
      createAbsenDto.userId = userId;
      createAbsenDto.waktu_absen = new Date();
      await this.absensService.create(createAbsenDto);
      req.flash('success', 'Successfully submitted attendance');
      res.redirect(`/program/${kelasId}`);
    } catch (error: any) {
      req.flash(
        'error',
        error.message ||
          'You have already submitted attendance for this meeting',
      );
      res.redirect(`/program/${kelasId}`);
    }
  }

  @Roles('admin')
  @Post(':pertemuanId')
  async createAbsen(
    @Param('pertemuanId') pertemuanId: string,
    @Res() res: Response,
    @Body() createAbsenDto: CreateAbsenDto,
    @Req() req: Request,
  ) {
    try {
      createAbsenDto.pertemuanId = pertemuanId;
      await this.absensService.create(createAbsenDto);
      req.flash('success', 'Successfully added attendance');
      res.redirect(`/session/${pertemuanId}`);
    } catch (error: any) {
      req.flash(
        'error',
        'Failed to add attendance, user has already submitted attendance for this session',
      );
      res.redirect(`/session/${pertemuanId}`);
    }
  }

  @Roles('user')
  @Get('form/:id')
  async formAbsen(
    @Res() res: Response,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const pertemuan = await this.absensService.findPertemuan(id);
    res.render('user/absen/create', { pertemuan, user: req.user });
  }

  @Roles('admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: any) {
    const absen = await this.absensService.findAll();
    res.render('admin/absen/index', { user: req.user, absen });
  }

  @Roles('admin')
  @Get('create/:pertemuanId')
  async absenCreate(
    @Res() res: Response,
    @Req() req: Request,
    @Param('pertemuanId') pertemuanId: string,
  ) {
    const users = await this.absensService.findUsers(pertemuanId);
    res.render('admin/absen/create', { user: req.user, users, pertemuanId });
  }

  @Roles('admin')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const absen = await this.absensService.findOne(id);
    res.render('admin/absen/detail', { user: req.user, absen });
  }

  @Roles('admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const absen = await this.absensService.findOne(id);
    res.render('admin/absen/edit', { user: req.user, absen });
  }

  @Roles('admin')
  @Patch(':absenId/:pertemuanId')
  async update(
    @Param('pertemuanId') pertemuanId: string,
    @Param('absenId') absenId: string,
    @Body() updateAbsenDto: UpdateAbsenDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.absensService.update(absenId, updateAbsenDto);
      req.flash('success', 'Successfully updated attendance');
      res.redirect(`/session/${pertemuanId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update attendance');
      res.redirect(`/session/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Delete(':absenId/:pertemuanId')
  async remove(
    @Param('absenId') absenId: string,
    @Param('pertemuanId') pertemuanId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.absensService.remove(absenId, pertemuanId);
      req.flash('success', 'Successfully delete attendace');
      res.redirect(`/session/${pertemuanId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete attendance');
      res.redirect(`/session/${pertemuanId}`);
    }
  }
}
