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
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Roles('admin')
  @Post(':weeksId')
  async create(
    @Param('weeksId') weeksId: number,
    @Body() createQuizDto: CreateQuizDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createQuizDto.weeksId = weeksId;
      await this.quizService.create(createQuizDto);
      req.flash('success', 'Quiz created successfully');
      res.redirect(`/week/${weeksId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create quiz');
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
    res.render('admin/quiz/create', { weeksId, user: req.user });
  }

  @Roles('admin')
  @Get(':quizId')
  async findOne(
    @Param('quizId') quizId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const quiz = await this.quizService.findOne(quizId);
    const scores = await this.quizService.findNilai(quizId);
    const questions = await this.quizService.findPertanyaan(quizId);
    res.render('admin/quiz/detail', {
      user: req.user,
      quiz,
      scores,
      questions,
    });
  }

  @Roles('admin')
  @Get('formEdit/:quizId')
  async formEdit(
    @Param('quizId') quizId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const quiz = await this.quizService.findOne(quizId);
    res.render('admin/quiz/edit', { user: req.user, quiz });
  }

  @Roles('user')
  @Get('form/:quizId')
  async formQuiz(
    @Param('quizId') quizId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const quiz = await this.quizService.findOne(quizId);
    const scores = await this.quizService.findNilaiUser(req.user!.id, quizId);
    const questions = await this.quizService.findPertanyaan(quizId);
    res.render('user/quiz/quiz', { user: req.user, quiz, scores, questions });
  }

  @Roles('user')
  @Get('start/:quizId')
  async startQuiz(
    @Param('quizId') quizId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const check = await this.quizService.checkStartQuestion(
      req.user!.id,
      quizId,
    );
    const questions = await this.quizService.findPertanyaan(quizId);
    if (check) {
      res.render('user/quiz/start', {
        user: req.user,
        quizId,
        questions,
        check,
      });
    } else {
      const remainingTime = await this.quizService.getRemainingTime(
        req.user!.id,
        quizId,
      );
      res.render('user/quiz/start', {
        user: req.user,
        quizId,
        questions,
        remainingTime,
        check,
      });
    }
  }

  @Roles('admin')
  @Patch(':quizId')
  async update(
    @Param('quizId') quizId: number,
    @Body() updateQuizDto: UpdateQuizDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.quizService.update(quizId, updateQuizDto);
      req.flash('success', 'Quiz updated successfully');
      res.redirect(`/quiz/${quizId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Quiz failed to updated ');
      res.redirect(`/quiz/${quizId}`);
    }
  }

  @Roles('admin')
  @Delete(':quizId/:weeksId')
  async remove(
    @Param('weeksId') weeksId: number,
    @Param('quizId') quizId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.quizService.remove(quizId);
      req.flash('success', 'Quiz deleted successfully');
      res.redirect(`/week/${weeksId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Quiz Failed to deleted');
      res.redirect(`/week/${weeksId}`);
    }
  }
}
