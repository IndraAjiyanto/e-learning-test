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
import { CourseQuestionsService } from './course_questions.service';
import { CreateCourseQuestionDto } from './dto/create-course_question.dto';
import { UpdateCourseQuestionDto } from './dto/update-course_question.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('question-program')
export class CourseQuestionsController {
  constructor(
    private readonly courseQuestionsService: CourseQuestionsService,
  ) {}

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const courseQuestion = await this.courseQuestionsService.findAll();
    res.render('super_admin/course_questions/index', {
      user: req.user,
      courseQuestion,
    });
  }

  @Roles('super_admin')
  @Get('formCreate/:courseId')
  async formCreate(
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course = await this.courseQuestionsService.findAllCourses();
    res.render('super_admin/course_questions/create', {
      user: req.user,
      course,
      courseId,
    });
  }

  @Roles('super_admin')
  @Post(':courseId')
  async create(
    @Param('courseId') courseId: string,
    @Body() createCourseQuestionDto: CreateCourseQuestionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createCourseQuestionDto.courseId = courseId;
      await this.courseQuestionsService.create(createCourseQuestionDto);
      req.flash('success', 'FAQ program created successfully');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ program  failed to create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const courseQuestion = await this.courseQuestionsService.findOne(id);
    const course = await this.courseQuestionsService.findAllCourses();
    res.render('super_admin/course_questions/edit', {
      user: req.user,
      courseQuestion,
      course,
    });
  }

  @Roles('super_admin')
  @Patch(':id/:courseId')
  async update(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
    @Body() updateCourseQuestionDto: UpdateCourseQuestionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.courseQuestionsService.update(id, updateCourseQuestionDto);
      req.flash('success', 'FAQ program updated successfully');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ program failed to update');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Delete(':id/:courseId')
  async remove(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.courseQuestionsService.remove(id);
      req.flash('success', 'FAQ program deleted successfully');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ program failed to delete');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
