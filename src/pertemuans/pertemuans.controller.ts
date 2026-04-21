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
import { PertemuansService } from './pertemuans.service';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { MaterisService } from 'src/materis/materis.service';

@UseGuards(AuthenticatedGuard)
@Controller('session')
export class PertemuansController {
  constructor(
    private readonly pertemuansService: PertemuansService,
    private readonly materisService: MaterisService,
  ) {}

  @Roles('admin')
  @Post()
  async create(
    @Body() createPertemuanDto: CreatePertemuanDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPertemuanDto.pertemuan_ke =
        await this.pertemuansService.noPertemuan(createPertemuanDto.mingguId);
      await this.pertemuansService.create(createPertemuanDto);
      req.flash('success', 'session succesfuly create');
      res.redirect(`program/detail/program/admin/${createPertemuanDto.mingguId}`);
    } catch (error) {
      req.flash('error', error.message || 'session unsucces create');
      res.redirect(`program/detail/program/admin/${createPertemuanDto.mingguId}`);
    }
  }

  @Roles('admin')
  @Post(':mingguId')
  async createPertemuan(
    @Body() createPertemuanDto: CreatePertemuanDto,
    @Res() res: Response,
    @Param('mingguId') mingguId: number,
    @Req() req: Request,
  ) {
    try {
      createPertemuanDto.mingguId = mingguId;
      createPertemuanDto.pertemuan_ke =
        await this.pertemuansService.noPertemuan(mingguId);
      await this.pertemuansService.create(createPertemuanDto);
      req.flash('success', 'session succesfuly create');
      res.redirect(`/week/${mingguId}`);
    } catch (error) {
      req.flash('error', error.message || 'session unsucces create');
      res.redirect(`/week/${mingguId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:mingguId')
  async formCreate(
    @Param('mingguId') mingguId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('admin/pertemuan/create', { user: req.user, mingguId });
  }

  @Roles('admin')
  @Get('formAdd/:id')
  async formAdd(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    res.render('admin/kelas/createPertemuan', { user: req.user, id });
  }

  @Roles('admin')
  @Get('formEdit/:id')
  async formEdit(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    const pertemuan = await this.pertemuansService.findOne(id);
    const kelas = await this.pertemuansService.findAllKelas();
    res.render('admin/pertemuan/edit', { user: req.user, kelas, pertemuan });
  }

  @Roles('admin')
  @Get('logbook/:pertemuanId')
  async getLogBook(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
  ) {
    const logbook = await this.pertemuansService.findLogBook(pertemuanId);
    res.json(logbook);
  }

  @Roles('admin')
  @Get('logbook-mentor/:pertemuanId')
  async getLogBookMentor(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
  ) {
    const logbook_mentor =
      await this.pertemuansService.findLogBookMentor(pertemuanId);
    res.json(logbook_mentor);
  }

  @Roles('admin')
  @Get('attendance/:pertemuanId')
  async getAbsen(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
  ) {
    const pertemuan = await this.pertemuansService.findOne(pertemuanId);
    const absen = await this.pertemuansService.findMuridInKelas(
      pertemuan.minggu.kelas.id,
      pertemuanId,
    );
    res.json(absen);
  }

  @Roles('admin')
  @Get('task/:pertemuanId')
  async getTugas(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
  ) {
    const tugas = await this.pertemuansService.findTugas(pertemuanId);
    res.json(tugas);
  }

  @Roles('admin')
  @Get('pdf/:pertemuanId')
  async getMateriPdf(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
  ) {
    const materiPdf = await this.materisService.findMateriPdf(pertemuanId);
    res.json(materiPdf);
  }

  @Roles('admin')
  @Get('video/:pertemuanId')
  async getMateriVideo(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
  ) {
    const materiVideo = await this.materisService.findMateriVideo(pertemuanId);
    res.json(materiVideo);
  }

  @Roles('admin')
  @Get('ppt/:pertemuanId')
  async getMateriPpt(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
  ) {
    const materiPpt = await this.materisService.findMateriPpt(pertemuanId);
    res.json(materiPpt);
  }

  @Roles('admin')
  @Get(':pertemuanId')
  async findOne(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const pertemuan = await this.pertemuansService.findOne(pertemuanId);
    res.render('admin/pertemuan/detail', {
      user: req.user,
      pertemuan,
    });
  }

  @Roles('admin')
  @Patch(':pertemuanId')
  async update(
    @Param('pertemuanId') pertemuanId: number,
    @Body() updatePertemuanDto: UpdatePertemuanDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.pertemuansService.update(pertemuanId, updatePertemuanDto);
      req.flash('success', 'Session successfuly update');
      res.redirect(`/session/${pertemuanId}`);
    } catch (error) {
      req.flash('error', error.message || 'Session unsuccess update');
      res.redirect(`/session/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Delete(':id/:mingguId')
  async remove(
    @Param('id') id: number,
    @Param('mingguId') mingguId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.pertemuansService.remove(id, mingguId);
      req.flash('success', 'session successfuly delete');
      res.redirect(`/week/${mingguId}`);
    } catch (error) {
      req.flash('error', error.message || 'session unsucces delete');
      res.redirect(`/week/${mingguId}`);
    }
  }
}
