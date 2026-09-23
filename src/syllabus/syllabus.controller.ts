import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import { SyllabusService } from './syllabus.service';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';
import { CreateQuizDto } from 'src/quiz/dto/create-quiz.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { CoursesService } from 'src/courses/courses.service';
import { flashToast } from 'src/common/utils/toast.util';

@Controller('syllabus')
export class SyllabusController {
  constructor(
    private readonly syllabusService: SyllabusService,
    private readonly coursesService: CoursesService,
  ) {}

  @Roles('admin', 'super_admin')
  @Post(':courseId')
  async create(
    @Param('courseId') courseId: string,
    @Body() createSyllabusDto: CreateSyllabusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.syllabusService.create(createSyllabusDto, courseId);
      flashToast(
        req,
        'Syllabus Created',
        'The new syllabus has been added to the program.',
      );
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Syllabus failed to create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Get('course/:courseId')
  async getByCourse(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const syllabusList = await this.syllabusService.findByCourse(courseId);
    res.json(syllabusList);
  }

  @Roles('admin', 'super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let syllabus = await this.syllabusService.findOne(id).catch(() => null);
    if (!syllabus) {
      const syllabusList = await this.syllabusService
        .findByCourse(id)
        .catch(() => []);
      if (syllabusList && syllabusList.length > 0) {
        syllabus = syllabusList[0];
      }
    }
    if (!syllabus) {
      req.flash('error', 'Syllabus not found');
      return res.redirect('/program');
    }
    const maxSyllabus = await this.syllabusService.findCourseSyllabus(
      syllabus.course?.id,
    );
    return res.render('admin/course/edit_syllabus', {
      user: req.user,
      syllabus,
      course: syllabus.course,
      courseId: syllabus.course?.id,
      maxSyllabus,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/quiz/:syllabusId')
  async getQuiz(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Res() res: Response,
  ) {
    const quiz = await this.syllabusService.findQuiz(syllabusId);
    res.json(quiz);
  }

  @Roles('admin', 'super_admin')
  @Get('quiz/create/:id')
  async formCreateQuiz(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let syllabus = await this.syllabusService.findOne(id).catch(() => null);
    if (!syllabus) {
      const syllabusList = await this.syllabusService
        .findByCourse(id)
        .catch(() => []);
      if (syllabusList && syllabusList.length > 0) {
        syllabus = syllabusList[0];
      }
    }
    if (!syllabus) {
      req.flash('error', 'Syllabus not found');
      return res.redirect('/program');
    }
    return res.render('admin/course/create_quiz', {
      user: req.user,
      syllabus,
      syllabusId: syllabus.id,
      course: syllabus.course,
      courseId: syllabus.course?.id,
    });
  }

  @Roles('admin', 'super_admin')
  @Post('quiz/:syllabusId')
  async createQuiz(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Body() createQuizDto: CreateQuizDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.syllabusService.createQuiz(syllabusId, createQuizDto);
      flashToast(
        req,
        'Quiz Created',
        'The new quiz has been added to this syllabus.',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create quiz');
      res.redirect(`/syllabus/${syllabusId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Get(':syllabusId')
  async findOne(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const syllabus = await this.syllabusService.findOne(syllabusId);
    if (!syllabus) {
      req.flash('error', 'Syllabus not found');
      return res.redirect('/program');
    }
    res.render('admin/course/detail_syllabus_item', {
      user: req.user,
      syllabus,
      course: syllabus.course,
      courseId: syllabus.course?.id,
    });
  }

  @Roles('admin', 'super_admin')
  @Patch('update/:syllabusId')
  async update(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Body() updateSyllabusDto: UpdateSyllabusDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const syllabus = await this.syllabusService.findOne(syllabusId);
      await this.syllabusService.update(syllabusId, updateSyllabusDto);
      flashToast(
        req,
        'Changes Saved',
        'The syllabus information has been updated.',
      );
      res.redirect(
        `/program/detail/program/admin/${syllabus?.course?.id || ''}`,
      );
    } catch (error: any) {
      req.flash('error', error.message || 'Syllabus failed to update');
      res.redirect('/program');
    }
  }

  @Roles('admin', 'super_admin')
  @Post('update/:syllabusId')
  async updatePost(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Body() updateSyllabusDto: UpdateSyllabusDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.update(syllabusId, updateSyllabusDto, req, res);
  }

  @Roles('admin', 'super_admin')
  @Delete(':id/:courseId')
  async remove(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.syllabusService.remove(id);
      flashToast(
        req,
        'Syllabus Deleted',
        'The syllabus has been permanently removed.',
      );
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Syllabus failed to delete');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}

