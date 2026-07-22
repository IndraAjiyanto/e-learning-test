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
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { CreateUserAnswerDto, UserAnswerDto } from './dto/create-user_answer.dto';

@UseGuards(AuthenticatedGuard)
@Controller('answer-users')
export class UserAnswersController {
  constructor(private readonly jawabanUsersService: UserAnswersService) {}

    @Roles('user')
  @Post('chose-answer')
  async choseAnswer(@Body() jawabanUserDto: UserAnswerDto) {
    try {
    await this.jawabanUsersService.createAnswer(jawabanUserDto);
      
    } catch (error: any) {
    }
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
      const jawabanUser = await this.jawabanUsersService.searchAnswerUser(quizId, req.user!.id);
      await this.jawabanUsersService.nilaiCreate(jawabanUser, quizId, req.user!.id);
      await this.jawabanUsersService.deleteAnswerUser(req.user!.id, quizId);

      req.flash('success', 'Success complete quiz');
      res.redirect(`/quiz/form/${quizId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'unsuccess complete quiz');
      res.redirect(`/quiz/form/${quizId}`);
    }
  }



}
