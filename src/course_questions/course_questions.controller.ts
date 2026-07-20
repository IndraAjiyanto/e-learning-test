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
import { CreatePertanyaanKelaDto } from './dto/create-pertanyaan_kela.dto';
import { UpdatePertanyaanKelaDto } from './dto/update-pertanyaan_kela.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('question-program')
export class CourseQuestionsController {
  constructor(
    private readonly pertanyaanKelasService: CourseQuestionsService,
  ) {}

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const pertanyaanKelas = await this.pertanyaanKelasService.findAll();
    res.render('super_admin/courseQuestions/index', {
      user: req.user,
      pertanyaanKelas,
    });
  }

  @Roles('super_admin')
  @Get('formCreate/:courseId')
  async formCreate(
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelass = await this.pertanyaanKelasService.findAllKelas();
    res.render('super_admin/courseQuestions/create', {
      user: req.user,
      kelass,
      courseId,
    });
  }

  @Roles('super_admin')
  @Post(':courseId')
  async create(
    @Param('courseId') courseId: number,
    @Body() createPertanyaanKelaDto: CreatePertanyaanKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPertanyaanKelaDto.courseId = courseId;
      await this.pertanyaanKelasService.create(createPertanyaanKelaDto);
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
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const pertanyaanKelas = await this.pertanyaanKelasService.findOne(id);
    const kelass = await this.pertanyaanKelasService.findAllKelas();
    res.render('super_admin/courseQuestions/edit', {
      user: req.user,
      pertanyaanKelas,
      kelass,
    });
  }

  @Roles('super_admin')
  @Patch(':id/:courseId')
  async update(
    @Param('id') id: number,
    @Param('courseId') courseId: number,
    @Body() updatePertanyaanKelaDto: UpdatePertanyaanKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.pertanyaanKelasService.update(+id, updatePertanyaanKelaDto);
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
    @Param('id') id: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.pertanyaanKelasService.remove(+id);
      req.flash('success', 'FAQ program deleted successfully');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ program failed to delete');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
