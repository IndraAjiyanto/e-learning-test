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
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { MaterialService } from 'src/materials/material.service';

@UseGuards(AuthenticatedGuard)
@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly materialService: MaterialService,
  ) {}

  @Roles('admin')
  @Post()
  async create(
    @Body() CreateSessionDto: CreateSessionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      CreateSessionDto.sessionOrder =
        await this.sessionService.noPertemuan(CreateSessionDto.weeksId);
      await this.sessionService.create(CreateSessionDto);
      req.flash('success', 'session succesfuly create');
      res.redirect(`program/detail/program/admin/${CreateSessionDto.weeksId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'session unsucces create');
      res.redirect(`program/detail/program/admin/${CreateSessionDto.weeksId}`);
    }
  }

  @Roles('admin')
  @Post(':weeksId')
  async createPertemuan(
    @Body() createPertemuanDto: CreateSessionDto,
    @Res() res: Response,
    @Param('weeksId') weeksId: number,
    @Req() req: Request,
  ) {
    try {
      createPertemuanDto.weeksId = weeksId;
      createPertemuanDto.sessionOrder =
        await this.sessionService.noPertemuan(weeksId);
      await this.sessionService.create(createPertemuanDto);
      req.flash('success', 'session succesfuly create');
      res.redirect(`/week/${weeksId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'session unsucces create');
      res.redirect(`/week/${weeksId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:weeksId')
  async formCreate(
    @Param('weeksId') weeksId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('admin/session/create', { user: req.user, weeksId });
  }

  @Roles('admin')
  @Get('formAdd/:id')
  async formAdd(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    res.render('admin/course/createPertemuan', { user: req.user, id });
  }

  @Roles('admin')
  @Get('formEdit/:id')
  async formEdit(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    const session = await this.sessionService.findOne(id);
    const course = await this.sessionService.findAllCourses();
    res.render('admin/session/edit', { user: req.user, course, session });
  }

  @Roles('admin')
  @Get('logbooks/:sessionId')
  async getLogBook(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
  ) {
    const logbooks = await this.sessionService.findLogBook(sessionId);
    res.json(logbooks);
  }

  @Roles('admin')
  @Get('logbooks-mentor/:sessionId')
  async getLogBookMentor(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
  ) {
    const mentor_logbook =
      await this.sessionService.findLogBookMentor(sessionId);
    res.json(mentor_logbook);
  }

  @Roles('admin')
  @Get('attendance/:sessionId')
  async getAbsen(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
  ) {
    const session = await this.sessionService.findOne(sessionId);
    const attendances = await this.sessionService.findStudentsInCourse(
      session.weeks.course.id,
      sessionId,
    );
    res.json(attendances);
  }

  @Roles('admin')
  @Get('task/:sessionId')
  async getTugas(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
  ) {
    const assignments = await this.sessionService.findTugas(sessionId);
    res.json(assignments);
  }

  @Roles('admin')
  @Get('pdf/:sessionId')
  async getMateriPdf(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
  ) {
    const materialPdf = await this.materialService.findMaterialPdf(sessionId);
    res.json(materialPdf);
  }

  @Roles('admin')
  @Get('video/:sessionId')
  async getMateriVideo(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
  ) {
    const materialVideo = await this.materialService.findMaterialVideo(sessionId);
    res.json(materialVideo);
  }

  @Roles('admin')
  @Get('ppt/:sessionId')
  async getMateriPpt(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
  ) {
    const materialPpt = await this.materialService.findMaterialPpt(sessionId);
    res.json(materialPpt);
  }

  @Roles('admin')
  @Get(':sessionId')
  async findOne(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const session = await this.sessionService.findOne(sessionId);
    res.render('admin/session/detail', {
      user: req.user,
      session,
    });
  }

  @Roles('admin')
  @Patch(':sessionId')
  async update(
    @Param('sessionId') sessionId: number,
    @Body() updateSessionDto: UpdateSessionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.sessionService.update(sessionId, updateSessionDto);
      req.flash('success', 'Session successfuly update');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Session unsuccess update');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Delete(':id/:weeksId')
  async remove(
    @Param('id') id: number,
    @Param('weeksId') weeksId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.sessionService.remove(id, weeksId);
      req.flash('success', 'session successfuly delete');
      res.redirect(`/week/${weeksId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'session unsucces delete');
      res.redirect(`/week/${weeksId}`);
    }
  }
}
