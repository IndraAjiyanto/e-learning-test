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
    } catch (error: any) {}
  }

  @Roles('user')
  @Post(':quizId')
  async create(
    @Param('quizId') quizId: number,
    @Req() req: Request,
    @Res() res: Response,
    @Body() createUserAnswerDto: CreateUserAnswerDto,
  ) {
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
      await this.userAnswersService.deleteAnswerUser(req.user!.id, quizId);

      const quiz = await this.quizService.findOne(quizId);
      req.flash('success', 'Success complete quiz');
      res.redirect(
        `/program/myProgram/${req.user!.id}?courseId=${quiz!.weeks.course.id}&tab=quiz&weekId=${quiz!.weeks.id}`,
      );
    } catch (error: any) {
      req.flash('error', error.message || 'unsuccess complete quiz');
      res.redirect(`/quiz/form/${quizId}`);
    }
  }
}
