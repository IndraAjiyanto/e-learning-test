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
} from '@nestjs/common';
import { WeeksService } from './weeks.service';
import { CreateWeeksDto } from './dto/create-weeks.dto';
import { UpdateWeeksDto } from './dto/update-weeks.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { CoursesService } from 'src/courses/courses.service';

@Controller('week')
export class WeeksController {
  constructor(
    private readonly weeksService: WeeksService,
    private readonly coursesService: CoursesService,
  ) {}

  @Roles('admin')
  @Post(':courseId')
  async create(
    @Param('courseId') courseId: number,
    @Body() createWeekDto: CreateWeeksDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createWeekDto.weekNumber =
        await this.weeksService.getSessionNumber(courseId);
      await this.weeksService.create(createWeekDto, courseId);
      req.flash('success', 'session succesfuly create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'session unsucces create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('admin')
  @Get('formAdd/:id')
  async formAdd(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    res.render('admin/weeks/create', { user: req.user, id });
  }

  @Roles('admin')
  @Get(':weeksId')
  async findOne(
    @Param('weeksId') weeksId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const weeks = await this.weeksService.findOne(weeksId);
    const lastSession = await this.weeksService.findLastSession(weeksId);
    res.render('admin/weeks/detail', {
      user: req.user,
      weeks,
      lastSession,
    });
  }

  @Roles('admin')
  @Get('/session/:weeksId')
  async getSession(@Param('weeksId') weeksId: number, @Res() res: Response) {
    const session = await this.weeksService.findSession(weeksId);
    res.json(session);
  }

  @Roles('admin')
  @Get('/quiz/:weeksId')
  async getQuiz(@Param('weeksId') weeksId: number, @Res() res: Response) {
    const quiz = await this.weeksService.findQuiz(weeksId);
    res.json(quiz);
  }

  @Roles('admin')
  @Get('formEdit/:weeksId')
  async formEdit(
    @Param('weeksId') weeksId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const weeks = await this.weeksService.findOne(weeksId);
    let lastWeek = false;
    let maxWeek = 0;
    if (weeks && weeks.course) {
      lastWeek = await this.coursesService.findLastWeek(weeks.course.id);
      maxWeek = await this.weeksService.findCourseWeeks(weeks.course.id);
    }
    res.render('admin/weeks/edit', {
      user: req.user,
      weeks,
      lastWeek,
      maxWeek,
    });
  }

  @Roles('admin')
  @Patch('update/:weeksId')
  async update(
    @Param('weeksId') weeksId: number,
    @Body() updateWeekDto: UpdateWeeksDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.weeksService.update(weeksId, updateWeekDto);
      req.flash('success', 'week successfully updated');
      res.redirect(`/week/${weeksId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'week failed updated');
      res.redirect(`/week/${weeksId}`);
    }
  }

  @Roles('admin')
  @Delete(':id/:courseId')
  async remove(
    @Param('id') id: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.weeksService.remove(id, courseId);
      req.flash('success', 'week successfully deleted');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'week failed deleted');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
