import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { QuizService } from 'src/quiz/quiz.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { SessionService } from 'src/sessions/session.service';
import { AnswersService } from 'src/answers/answers.service';
import { UserAnswersService } from 'src/user_answers/user_answers.service';
@UseGuards(AuthenticatedGuard)
@Controller('question')
export class QuestionsController {
  constructor(
    private readonly pertanyaansService: QuestionsService,
    private readonly sessionService: SessionService,
    private readonly quizService: QuizService,
    private readonly jawabansService: AnswersService,
    private readonly jawabanUsersService: UserAnswersService,
  ) {}

  @Roles('admin')
  @Post(':quizId')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'quiz_question',
  })
  async create(
    @Res() res: Response,
    @Req() req: Request,
    @Body() createPertanyaanDto: CreateQuestionDto,
    @Param('quizId') quizId: number,
  ) {
    try {
      createPertanyaanDto.quizId = quizId;
      createPertanyaanDto.image = req.body.uploadedImageUrls?.[0];

      const questions =
        await this.pertanyaansService.create(createPertanyaanDto);
      for (let i = 0; i < createPertanyaanDto.options.length; i++) {
        await this.jawabansService.create({
          questionsId: questions['id'],
          answer: createPertanyaanDto.options[i],
          is_correct: i === Number(createPertanyaanDto.answers),
        });
      }

      req.flash('success', 'success create question');
      return res.redirect(`/quiz/${quizId}`);
    } catch (err) {
      req.flash('error', err.message || 'unsuccess create question');
      return res.redirect(`/quiz/${quizId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:quizId')
  async formCreate(
    @Req() req: Request,
    @Res() res: Response,
    @Param('quizId') quizId: number,
  ) {
    const quiz = await this.quizService.findOne(quizId);
    res.render('admin/questions/create', { user: req.user, quiz });
  }

  @Roles('admin')
  @Get('FormEdit/:questionId')
  async findQuestions(
    @Req() req: Request,
    @Res() res: Response,
    @Param('questionId') questionId: number,
  ) {
    const questions = await this.pertanyaansService.findOne(questionId);
    res.render('admin/questions/edit', { user: req.user, questions });
  }

  @Roles('user')
  @Get('quiz/:sessionId/:courseId')
  async findQuestionsBySession(
    @Param('sessionId') sessionId: number,
    @Param('courseId') courseId: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const session = await this.sessionService.findOne(sessionId);
    const questions =
      await this.pertanyaansService.findQuestions(sessionId);
    res.render('user/quiz/quiz', {
      user: req.user,
      questions,
      session,
      courseId,
    });
  }

  @Roles('user')
  @Get('quiz/user/:sessionId/:userId')
  async findQuestionDetailsBySession(
    @Param('sessionId') sessionId: number,
    @Param('userId') userId: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const session = await this.sessionService.findOne(sessionId);
    const questions =
      await this.pertanyaansService.findQuestions(sessionId);
    const userAnswers =
      await this.jawabanUsersService.findAnswersByUser(userId);
    const scores = await this.jawabanUsersService.AmountNilai(
      sessionId,
      userId,
    );
    res.render('user/quiz/detail', {
      user: req.user,
      questions,
      session,
      userAnswers,
      scores,
    });
  }

  @Roles('admin')
  @Patch(':questionId/:quizId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'quiz_question',
  })
  async update(
    @Param('questionId') questionId: number,
    @Param('quizId') quizId: number,
    @Body() updatePertanyaanDto: UpdateQuestionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const questions = await this.pertanyaansService.findOne(questionId);
      if (req.body.uploadedImageUrls?.length) {
        updatePertanyaanDto.image = req.body.uploadedImageUrls[0];
        if (questions.image) {
          await this.pertanyaansService.deleteFile(questions.image);
        }
      }
      await this.pertanyaansService.update(questionId, updatePertanyaanDto);
      req.flash('success', 'successfuly update question');
      res.redirect(`/quiz/${quizId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'unsuccess update question');
      res.redirect(`/quiz/${quizId}`);
    }
  }

  @Roles('admin')
  @Delete(':questionId/:quizId')
  async remove(
    @Param('quizId') quizId: number,
    @Param('questionId') questionId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const questions = await this.pertanyaansService.findOne(questionId);
      if (questions.image) {
        await this.pertanyaansService.deleteFile(questions.image);
      }
      await this.pertanyaansService.remove(questionId);
      req.flash('success', 'successfuly delete question');
      res.redirect(`/quiz/${quizId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'unsuccess delete question');
      res.redirect(`/quiz/${quizId}`);
    }
  }
}
