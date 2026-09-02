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
    @Param('assignmentId') assignmentId: string,
    @Param('sessionId') sessionId: string,
    @Body() createAssignmentAnswerDto: CreateAssignmentAnswersDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const wantsJson = req.headers.accept?.includes('application/json');
    try {
      createAssignmentAnswerDto.process = 'process';
      if (req.user) {
        createAssignmentAnswerDto.userId = req.user.id;
      }
      createAssignmentAnswerDto.taskId = assignmentId;
      const answer = await this.answerTasksService.create(
        createAssignmentAnswerDto,
      );
      if (wantsJson) {
        return res.json({
          success: true,
          message: 'submission successfuly send',
          answer: {
            id: answer.id,
            file: answer.file,
            process: answer.process,
            createdAt: answer.createdAt,
          },
        });
      }
      req.flash('success', 'submission successfuly send');
      res.redirect(`/answer-assigment/${sessionId}/${assignmentId}`);
    } catch (error: any) {
      const message = error.message || 'submission unsuccess send';
      if (wantsJson) {
        return res.status(400).json({ success: false, message });
      }
      req.flash('error', message);
      res.redirect(`/answer-assigment/${sessionId}/${assignmentId}`);
    }
  }

  @Roles('user')
  @Get(':sessionId/:assignmentId')
  async findAnswer(
    @Param('assignmentId') assignmentId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (req.user) {
      const assignments =
        await this.answerTasksService.findAssignment(assignmentId);
      const taskAnswers = await this.answerTasksService.findAssignmentAnswer(
        req.user.id,
        assignmentId,
      );
      const answerExists = await this.answerTasksService.findExistingAnswer(
        req.user.id,
        assignmentId,
      );
      res.render('user/assignments', {
        user: req.user,
        assignment: assignments,
        assignment_answer: taskAnswers,
        answerExists,
      });
    }
  }

  @Roles('admin')
  @Get(':assignmentId')
  async findOne(
    @Param('assignmentId') assignmentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const assignments =
      await this.answerTasksService.findAssignment(assignmentId);
    const taskAnswers =
      await this.answerTasksService.findAllAssignmentAnswers(assignmentId);
    res.render('admin/answers-assignments/index', {
      user: req.user,
      assignment_answer: taskAnswers,
      assignment: assignments,
    });
  }

  @Roles('admin', 'user')
  @Patch(':assignmentId/:assignment_answerId')
  async update(
    @Param('assignment_answerId') assignment_answerId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() updateAssignmentAnswerDto: UpdateAssignmentAnswersDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wantsJson = req.headers.accept?.includes('application/json');
    try {
      const assignments =
        await this.answerTasksService.findAssignment(assignmentId);
      if (!updateAssignmentAnswerDto.process) {
        updateAssignmentAnswerDto.process = 'process';
      }
      const answer = await this.answerTasksService.update(
        assignment_answerId,
        updateAssignmentAnswerDto,
      );
      if (updateAssignmentAnswerDto.comment) {
        await this.answerTasksService.createComment(
          updateAssignmentAnswerDto.comment,
          assignment_answerId,
        );
      }
      if (wantsJson) {
        return res.json({
          success: true,
          message: 'Update answer successfuly',
          answer: {
            id: answer.id,
            file: answer.file,
            process: answer.process,
            createdAt: answer.createdAt,
          },
        });
      }
      if (req.user?.role.includes('admin')) {
        req.flash('success', 'Update answer successfuly');
        res.redirect(`/answer-assigment/${assignmentId}`);
      } else if (req.user?.role.includes('user')) {
        req.flash('success', 'Update answer successfuly');
        res.redirect(
          `/answer-assigment/${assignments.session.id}/${assignments.id}`,
        );
      }
    } catch (error: any) {
      const message = error.message || 'Update answer unsuccessfully';
      if (wantsJson) {
        return res.status(400).json({ success: false, message });
      }
      const assignments =
        await this.answerTasksService.findAssignment(assignmentId);
      if (req.user?.role.includes('admin')) {
        req.flash('error', message);
        res.redirect(`/answer-assigment/${assignmentId}`);
      } else if (req.user?.role.includes('user')) {
        req.flash('error', message);
        res.redirect(
          `/answer-assigment/${assignments.session.id}/${assignments.id}`,
        );
      }
    }
  }
}
