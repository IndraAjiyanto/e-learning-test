import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserAnswersService } from './user_answers.service';
import { flashToast, flashToastError } from 'src/common/utils/toast.util';
import { QuizService } from 'src/quiz/quiz.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import {
  CreateUserAnswerDto,
  UserAnswerDto,
} from './dto/create-user_answer.dto';

@UseGuards(AuthenticatedGuard)
@Controller('answer-users')
export class UserAnswersController {
  constructor(
    private readonly userAnswersService: UserAnswersService,
    private readonly quizService: QuizService,
  ) {}

  @Roles('user')
  @Post('chose-answer')
  async choseAnswer(@Body() userAnswerDto: UserAnswerDto) {
    try {
      await this.userAnswersService.createAnswer(userAnswerDto);
    } catch {
      // ignore
    }
  }

  @Roles('user')
  @Post(':quizId')
  async create(
    @Param('quizId') quizId: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() _createUserAnswerDto: CreateUserAnswerDto,
  ) {
    void _createUserAnswerDto;
    try {
      const userAnswer = await this.userAnswersService.searchAnswerUser(
        quizId,
        req.user!.id,
      );
      await this.userAnswersService.createScore(
        userAnswer,
        quizId,
        req.user!.id,
      );
      flashToast(
        req,
        'Quiz Completed',
        'Your answers have been submitted successfully.',
      );
      res.redirect(`/quiz/form/${quizId}`);
    } catch (error: unknown) {
      const err = error as Error;
      // Pastikan quizStart direset agar sesi berikutnya tidak langsung time's up
      try {
        await this.userAnswersService.resetQuizState(req.user!.id);
      } catch {
        // ignore
      }
      flashToastError(
        req,
        'Quiz not submitted',
        err.message || 'Please try again in a moment.',
      );
      res.redirect(`/quiz/form/${quizId}`);
    }
  }
}
