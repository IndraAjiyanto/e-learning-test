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
import { CreateJawabanUserDto } from './dto/create-jawaban_user.dto';

@UseGuards(AuthenticatedGuard)
@Controller('jawaban-users')
export class JawabanUsersController {
  constructor(private readonly jawabanUsersService: JawabanUsersService) {}

  @Roles('user')
  @Post(':quizId')
  async create(
    @Param('quizId') quizId: number,
    @Req() req: Request,
    @Res() res: Response,
    @Body() createJawabanUserDto: CreateJawabanUserDto,
  ) {
    try {
      const jawabanUser = Object.entries(createJawabanUserDto).map(
        ([key, value]) => {
          const pertanyaanId = Number(key.replace('q-', ''));
          return {
            pertanyaanId,
            jawabanId: Number(value),
            userId: req.user!.id,
          };
        },
      );

      await this.jawabanUsersService.create({ jawabanUser });
      await this.jawabanUsersService.nilaiCreate({ jawabanUser });

      req.flash('success', 'berhasil menjawab pertanyaan');
      res.redirect(`/quiz/form/${quizId}`);
    } catch (error) {
      req.flash('error', error.message || 'gagal menjawab pertanyaan');
      res.redirect(`/quiz/form/${quizId}`);
    }
  }
}
