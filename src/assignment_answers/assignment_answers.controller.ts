import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AnswerTasksService } from './assignment_answers.service';
import { CreateAssignmentAnswersDto } from './dto/create-assignment_answers.dto';
import { UpdateAssignmentAnswersDto } from './dto/update-assignment_answers.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('answer-assigment')
export class AnswerTasksController {
  constructor(private readonly answerTasksService: AnswerTasksService) {}

  @Roles('user')
  @Post(':tugasId/:sessionId')
  async create(
    @Param('tugasId') tugasId: number,
    @Param('sessionId') sessionId: number,
    @Body() createJawabanTugassDto: CreateAssignmentAnswersDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createJawabanTugassDto.process = 'proces';
      if (req.user) {
        createJawabanTugassDto.userId = req.user.id;
      }
      createJawabanTugassDto.taskId = tugasId;
      await this.answerTasksService.create(createJawabanTugassDto);
      req.flash('success', 'submission successfuly send');
      res.redirect(`/answer-assigment/${sessionId}/${tugasId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'submission unsuccess send');
      res.redirect(`/answer-assigment/${sessionId}/${tugasId}`);
    }
  }

  @Roles('user')
  @Get(':sessionId/:tugasId')
  async findJawaban(
    @Param('tugasId') tugasId: number,
    @Param('sessionId') sessionId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (req.user) {
      const assignments = await this.answerTasksService.findTugas(tugasId);
      const taskAnswers = await this.answerTasksService.findJawabanTugas(
        req.user.id,
        tugasId,
      );
      const jawabanExists = await this.answerTasksService.findJawabanExists(
        req.user.id,
        tugasId,
      );
      res.render('user/assignments', {
        user: req.user,
        assignments,
        taskAnswers,
        jawabanExists,
      });
    }
  }

  @Roles('admin')
  @Get(':tugasId')
  async findOne(
    @Param('tugasId') tugasId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const assignments = await this.answerTasksService.findTugas(tugasId);
    const taskAnswers =
      await this.answerTasksService.findAllJawabanTugas(tugasId);
    res.render('admin/answers-assignments/index', {
      user: req.user,
      taskAnswers,
      assignments,
    });
  }

  @Roles('admin', 'user')
  @Patch(':tugasId/:jawaban_tugasId')
  async update(
    @Param('jawaban_tugasId') jawaban_tugasId: number,
    @Param('tugasId') tugasId: number,
    @Body() updateJawabanTugassDto: UpdateAssignmentAnswersDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const assignments = await this.answerTasksService.findTugas(tugasId);
      if (!updateJawabanTugassDto.process) {
        updateJawabanTugassDto.process = 'proces';
      }
      await this.answerTasksService.update(
        jawaban_tugasId,
        updateJawabanTugassDto,
      );
      if (updateJawabanTugassDto.comment) {
        await this.answerTasksService.createKomentar(
          updateJawabanTugassDto.comment,
          jawaban_tugasId,
        );
      }
      if (req.user?.role.includes('admin')) {
        req.flash('success', 'Update answer successfuly');
        res.redirect(`/answer-assigment/${tugasId}`);
      } else if (req.user?.role.includes('user')) {
        req.flash('success', 'Update answer successfuly');
        res.redirect(`/answer-assigment/${assignments.session.id}/${assignments.id}`);
      }
    } catch (error: any) {
      const assignments = await this.answerTasksService.findTugas(tugasId);
      if (req.user?.role.includes('admin')) {
        req.flash('error', error.message || 'Update answer unsuccessfully');
        res.redirect(`/answer-assigment/${tugasId}`);
      } else if (req.user?.role.includes('user')) {
        req.flash('error', error.message || 'Update answer unsuccessfully');
        res.redirect(`/answer-assigment/${assignments.session.id}/${assignments.id}`);
      }
    }
  }
}
