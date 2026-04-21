import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JawabanUsersService } from './jawaban_users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { CreateJawabanUserDto, JawabanUserDto } from './dto/create-jawaban_user.dto';

@UseGuards(AuthenticatedGuard)
@Controller('answer-users')
export class JawabanUsersController {
  constructor(private readonly jawabanUsersService: JawabanUsersService) {}

    @Roles('user')
  @Post('chose-answer')
  async choseAnswer(@Body() jawabanUserDto: JawabanUserDto) {
    try {
    await this.jawabanUsersService.createAnswer(jawabanUserDto);
      
    } catch (error) {
      console.log("error" + error);
    }
  }

  @Roles('user')
  @Post(':quizId')
  async create(
    @Param('quizId') quizId: number,
    @Req() req: Request,
    @Res() res: Response,
    @Body() createJawabanUserDto: CreateJawabanUserDto,
  ) {
    try {
      const jawabanUser = await this.jawabanUsersService.searchAnswerUser(quizId, req.user!.id);
      await this.jawabanUsersService.nilaiCreate(jawabanUser, quizId, req.user!.id);
      await this.jawabanUsersService.deleteAnswerUser(req.user!.id, quizId);

      req.flash('success', 'Success complete quiz');
      res.redirect(`/quiz/form/${quizId}`);
    } catch (error) {
      req.flash('error', error.message || 'unsuccess complete quiz');
      res.redirect(`/quiz/form/${quizId}`);
    }
  }



}
