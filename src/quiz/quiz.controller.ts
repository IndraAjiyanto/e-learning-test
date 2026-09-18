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
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly usersService: UsersService,
  ) {}

  @Roles('admin')
  @Post(':weeksId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Param('weeksId', new ParseUUIDPipe()) weeksId: string,
    @Body() createQuizDto: CreateQuizDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createQuizDto.weeksId = weeksId;
      await this.quizService.create(createQuizDto);
      flashToast(
        req,
        'Quiz Created',
        'The new quiz has been added to this week.',
      );
      res.redirect(`/week/${weeksId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create quiz');
      res.redirect(`/week/${weeksId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:weeksId')
  async formCreate(
    @Param('weeksId', new ParseUUIDPipe()) weeksId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('admin/quiz/create', { weeksId, user: req.user });
  }

  @Roles('admin')
  @Get(':quizId')
  async findOne(
    @Param('quizId') quizId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const quiz = await this.quizService.findOne(quizId);
    const scores = await this.quizService.findScore(quizId);
    const questions = await this.quizService.findQuestions(quizId);
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
    @Param('quizId') quizId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const quiz = await this.quizService.findOne(quizId);
    res.render('admin/quiz/edit', { user: req.user, quiz });
  }

  @Roles('user')
  @Get('form/:quizId')
  async formQuiz(
    @Param('quizId') quizId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const quiz = await this.quizService.findOne(quizId);
    const scores = await this.quizService.findUserScore(req.user!.id, quizId);
    const questions = await this.quizService.findQuestions(quizId);

    // Riwayat nilai dulu hanya dua kolom - angka dan lencana lulus/gagal -
    // tanpa nomor percobaan maupun tanggal, jadi empat baris "0 Failed"
    // tidak bisa dibedakan satu sama lain. Nomor percobaan dihitung dari
    // urutan waktu (terlama = percobaan 1), lalu dibalik supaya yang terbaru
    // tampil paling atas.
    const minScore = quiz?.minScore ?? 0;
    const byTime = [...scores].sort(
      (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
    );
    const attempts = byTime
      .map((score, index) => ({
        ...score,
        attempt: index + 1,
        passed: score.score >= minScore,
      }))
      .reverse();
    const best = byTime.reduce((max, s) => Math.max(max, s.score), 0);

    res.render('user/quiz/quiz', {
      user: req.user,
      quiz,
      scores,
      questions,
      attempts,
      best,
      passed: byTime.length > 0 && best >= minScore,
      questionCount: questions.length,
      bareShell: true,
    });
  }

  @Roles('user')
  @Get('start/:quizId')
  async startQuiz(
    @Param('quizId') quizId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const check = await this.quizService.checkStartQuestion(
      req.user!.id,
      quizId,
    );
    const questions = await this.quizService.findQuestions(quizId);
    const quiz = await this.quizService.findOne(quizId);
    const userWithCourses = await this.usersService.findWithCourses(
      req.user!.id,
    );
    const logbooks = await this.usersService.findAllLogbooks(req.user!.id);
    const portfolio = await this.usersService.findPortfolio(req.user!.id);
    const activeCourse = userWithCourses?.userCourses.find(
      (userCourse) => userCourse.course?.id === quiz?.weeks?.course?.id,
    )?.course;

    if (check) {
      // res.render('user/user_profile/index', {
      //   user: req.user,
      //   userWithCourses,
      //   logbooks,
      //   portfolio,
      //   activeCourse,
      //   activeSection: 'quiz-start',
      //   quizId,
      //   questions,
      //   check,
      // });
      res.render('user/quiz/start', {
        user: req.user,
        quizId,
        pertanyaan: questions,
        check,
        bareShell: true,
      });
    } else {
      const remainingTime = await this.quizService.getRemainingTime(
        req.user!.id,
        quizId,
      );
      // res.render('user/user_profile/index', {
      //   user: req.user,
      //   userWithCourses,
      //   logbooks,
      //   portfolio,
      //   activeCourse,
      //   activeSection: 'quiz-start',
      //   quizId,
      //   questions,
      //   remainingTime,
      //   check,
      // });
      res.render('user/quiz/start', {
        user: req.user,
        quizId,
        pertanyaan: questions,
        remainingTime,
        check,
        bareShell: true,
      });
    }
  }

  @Roles('admin')
  @Patch(':quizId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('quizId') quizId: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.quizService.update(quizId, updateQuizDto);
      flashToast(
        req,
        'Changes Saved',
        'The quiz information has been updated.',
      );
      res.redirect(`/quiz/${quizId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Quiz failed to updated ');
      res.redirect(`/quiz/${quizId}`);
    }
  }

  @Roles('admin')
  @Delete(':quizId/:weeksId')
  async remove(
    @Param('weeksId', new ParseUUIDPipe()) weeksId: string,
    @Param('quizId', new ParseUUIDPipe()) quizId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.quizService.remove(quizId);
      flashToast(req, 'Quiz Deleted', 'The quiz has been permanently removed.');
      res.redirect(`/week/${weeksId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Quiz Failed to deleted');
      res.redirect(`/week/${weeksId}`);
    }
  }
}
