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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizProgress } from 'src/entities/quiz_progress.entity';
import { Score } from 'src/entities/score.entity';
import { UserCourse } from 'src/entities/user_course.entity';

@UseGuards(AuthenticatedGuard)
@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    @InjectRepository(QuizProgress)
    private readonly quizProgressRepository: Repository<QuizProgress>,
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
  ) {}

  private async getQuizzes(userId: number) {
    const userCourses = await this.userCourseRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'course.weeks', 'course.weeks.quiz'],
    });
    const quizzes: Array<{
      id: number;
      title: string;
      courseName: string;
      weekNumber: number;
      weekName: string;
      duration: number;
      minScore: number;
      lastSubmitted: string | null;
      submitDate: string | null;
      isCompleted: boolean;
      score: number | null;
    }> = [];
    for (const uc of userCourses) {
      if (uc.course && uc.course.weeks) {
        for (const week of uc.course.weeks) {
          if (week.quiz && week.quiz.length > 0) {
            for (const quiz of week.quiz) {
              const quizProgress = await this.quizProgressRepository.findOne({
                where: { user: { id: userId }, quiz: { id: quiz.id } },
              });
              const score = await this.scoreRepository.findOne({
                where: { user: { id: userId }, quiz: { id: quiz.id } },
                order: { createdAt: 'DESC' },
              });
              quizzes.push({
                id: quiz.id,
                title: quiz.quizName,
                courseName: uc.course.name,
                weekNumber: week.weekNumber,
                weekName: week.description || `Week ${week.weekNumber}`,
                duration: quiz.duration,
                minScore: quiz.minScore,
                lastSubmitted: quizProgress?.createdAt
                  ? quizProgress.createdAt.toISOString().split('T')[0]
                  : null,
                submitDate: score?.createdAt
                  ? score.createdAt.toISOString().split('T')[0]
                  : null,
                isCompleted: quizProgress?.process === true,
                score: score?.score ?? null,
              });
            }
          }
        }
      }
    }
    return quizzes;
  }

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
    const scores = await this.quizService.findUserScore(req.user!.id, quizId);
    const questions = await this.quizService.findQuestions(quizId);
    const quizzes = await this.getQuizzes(req.user!.id);
    res.render('user/user_profile/index', {
      user: req.user,
      quiz,
      scores,
      questions,
      quizzes,
      activeSection: 'quizDetail',
    });
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
    const questions = await this.quizService.findQuestions(quizId);
    const scores = await this.quizService.findUserScore(req.user!.id, quizId);
    const quiz = await this.quizService.findOne(quizId);
    const quizzes = await this.getQuizzes(req.user!.id);
    if (check) {
      res.render('user/user_profile/index', {
        user: req.user,
        quiz,
        quizId,
        questions,
        scores,
        check,
        quizzes,
        activeSection: 'startQuiz',
      });
    } else {
      const remainingTime = await this.quizService.getRemainingTime(
        req.user!.id,
        quizId,
      );
      res.render('user/user_profile/index', {
        user: req.user,
        quiz,
        quizId,
        questions,
        remainingTime,
        scores,
        check,
        quizzes,
        activeSection: 'startQuiz',
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
