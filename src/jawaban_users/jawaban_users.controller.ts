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

          // cek kalau value array, ambil yang terakhir
          let jawabanId: number | null = null;
          if (Array.isArray(value)) {
            // filter value kosong dan ambil terakhir
            const filtered = value.filter((v) => v !== '');
            jawabanId = filtered.length
              ? Number(filtered[filtered.length - 1])
              : null;
          } else if (value !== '') {
            jawabanId = Number(value);
          }

          console.log(
            `Pertanyaan ID: ${pertanyaanId}, Jawaban ID: ${jawabanId}`,
          );
          return {
            pertanyaanId,
            jawabanId,
            userId: req.user!.id,
          };
        },
      );

      await this.jawabanUsersService.create({ jawabanUser });
      await this.jawabanUsersService.nilaiCreate({ jawabanUser });

      req.flash('success', 'Success complete quiz');
      res.redirect(`/quiz/form/${quizId}`);
    } catch (error) {
      req.flash('error', error.message || 'unsuccess complete quiz');
      res.redirect(`/quiz/form/${quizId}`);
    }
  }
}
