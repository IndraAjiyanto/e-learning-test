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
  @Post(':assignmentId/:sessionId')
  async create(
    @Param('assignmentId') assignmentId: number,
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
      createJawabanTugassDto.taskId = assignmentId;
      await this.answerTasksService.create(createJawabanTugassDto);
      req.flash('success', 'submission successfuly send');
      res.redirect(`/answer-assigment/${sessionId}/${assignmentId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'submission unsuccess send');
      res.redirect(`/answer-assigment/${sessionId}/${assignmentId}`);
    }
  }

  @Roles('user')
  @Get(':sessionId/:assignmentId')
  async findJawaban(
    @Param('assignmentId') assignmentId: number,
    @Param('sessionId') sessionId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (req.user) {
      const assignments = await this.answerTasksService.findTugas(assignmentId);
      const taskAnswers = await this.answerTasksService.findJawabanTugas(
        req.user.id,
        assignmentId,
      );
      const jawabanExists = await this.answerTasksService.findJawabanExists(
        req.user.id,
        assignmentId,
      );
      res.render('user/assignments', {
        user: req.user,
        assignment: assignments,
        jawaban_tugas: taskAnswers,
        jawabanExists,
      });
    }
  }

  @Roles('admin')
  @Get(':assignmentId')
  async findOne(
    @Param('assignmentId') assignmentId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const assignments = await this.answerTasksService.findTugas(assignmentId);
    const taskAnswers =
      await this.answerTasksService.findAllJawabanTugas(assignmentId);
    res.render('admin/answers-assignments/index', {
      user: req.user,
      jawaban_tugas: taskAnswers,
      assignment: assignments,
    });
  }

  @Roles('admin', 'user')
  @Patch(':assignmentId/:assignment_answerId')
  async update(
    @Param('assignment_answerId') assignment_answerId: number,
    @Param('assignmentId') assignmentId: number,
    @Body() updateJawabanTugassDto: UpdateAssignmentAnswersDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const assignments = await this.answerTasksService.findTugas(assignmentId);
      if (!updateJawabanTugassDto.process) {
        updateJawabanTugassDto.process = 'proces';
      }
      await this.answerTasksService.update(
        assignment_answerId,
        updateJawabanTugassDto,
      );
      if (updateJawabanTugassDto.comment) {
        await this.answerTasksService.createKomentar(
          updateJawabanTugassDto.comment,
          assignment_answerId,
        );
      }
      if (req.user?.role.includes('admin')) {
        req.flash('success', 'Update answer successfuly');
        res.redirect(`/answer-assigment/${assignmentId}`);
      } else if (req.user?.role.includes('user')) {
        req.flash('success', 'Update answer successfuly');
        res.redirect(`/answer-assigment/${assignments.session.id}/${assignments.id}`);
      }
    } catch (error: any) {
      const assignments = await this.answerTasksService.findTugas(assignmentId);
      if (req.user?.role.includes('admin')) {
        req.flash('error', error.message || 'Update answer unsuccessfully');
        res.redirect(`/answer-assigment/${assignmentId}`);
      } else if (req.user?.role.includes('user')) {
        req.flash('error', error.message || 'Update answer unsuccessfully');
        res.redirect(`/answer-assigment/${assignments.session.id}/${assignments.id}`);
      }
    }
  }
}
