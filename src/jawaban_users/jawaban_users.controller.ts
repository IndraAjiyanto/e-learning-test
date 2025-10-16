import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { JawabanUsersService } from './jawaban_users.service';
import { UpdateJawabanUserDto } from './dto/update-jawaban_user.dto';
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
async create(@Param('quizId') quizId:number, @Req() req: Request, @Res() res: Response, @Body() createJawabanUserDto: CreateJawabanUserDto,) {
  try {
    const jawabanUser = Object.entries(createJawabanUserDto).map(([key, value]) => {
      const pertanyaanId = Number(key.replace("q-", ""));
      return {
        pertanyaanId,
        jawabanId: Number(value),
        userId: req.user!.id,
      };
    });

    console.log(jawabanUser)

    await this.jawabanUsersService.create({ jawabanUser });
    await this.jawabanUsersService.nilaiCreate({jawabanUser})

    req.flash('success', 'berhasil menjawab pertanyaan');
    res.redirect(`/quiz/form/${quizId}`);
  } catch (error) {
    console.log(error)
    req.flash('error', 'gagal menjawab pertanyaan');
    res.redirect(`/quiz/form/${quizId}`);
  }
}

  @Get()
  findAll() {
    return this.jawabanUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jawabanUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJawabanUserDto: UpdateJawabanUserDto) {
    return this.jawabanUsersService.update(+id, updateJawabanUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jawabanUsersService.remove(+id);
  }
}
