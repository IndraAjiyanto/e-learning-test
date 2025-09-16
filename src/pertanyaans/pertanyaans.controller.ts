import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { PertanyaansService } from './pertanyaans.service';
import { CreatePertanyaanDto } from './dto/create-pertanyaan.dto';
import { UpdatePertanyaanDto } from './dto/update-pertanyaan.dto';
import { Request, Response } from 'express';
import { PertemuansService } from 'src/pertemuans/pertemuans.service';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { JawabansService } from 'src/jawabans/jawabans.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JawabanUsersService } from 'src/jawaban_users/jawaban_users.service';
import { QuizService } from 'src/quiz/quiz.service';

@UseGuards(AuthenticatedGuard)
@Controller('pertanyaans')
export class PertanyaansController {
constructor(
  private readonly pertanyaansService: PertanyaansService,
  private readonly pertemuanService: PertemuansService,
  private readonly quizService: QuizService,
  private readonly jawabansService: JawabansService,
  private readonly jawabanUsersService: JawabanUsersService,
) {}

@Roles('admin')
@Post(':quizId')
async create(
  @Res() res: Response,
  @Req() req: Request,
  @Body() createPertanyaanDto: CreatePertanyaanDto,
  @Param('quizId') quizId: number,
) {
  try {
    createPertanyaanDto.quizId = quizId;
    const pertanyaan = await this.pertanyaansService.create(createPertanyaanDto);
    for (let i = 0; i < createPertanyaanDto.pilihan.length; i++) {
      await this.jawabansService.create({
        pertanyaanId: pertanyaan['id'],
        jawaban: createPertanyaanDto.pilihan[i],
        jawaban_benar: i === Number(createPertanyaanDto.jawaban), 
      });
    }

    req.flash('success', 'Berhasil membuat pertanyaan beserta jawabannya');
    return res.redirect(`/quiz/${quizId}`);
  } catch (err) {
    req.flash('error', 'Gagal membuat pertanyaan');
    return res.redirect(`/quiz/${quizId}`);
  }
}

  @Roles('admin')
  @Get('formCreate/:quizId')
  async formCreate(@Req() req:Request, @Res() res:Response, @Param('quizId') quizId:number){
    const quiz = await this.quizService.findOne(quizId)
    res.render('admin/pertanyaan/create', {user: req.user, quiz})
  }

  @Roles('admin')
  @Get('FormEdit/:pertanyaanId')
  async findPertanyaan(@Req() req:Request, @Res() res:Response, @Param('pertanyaanId') pertanyaanId:number) {
    const pertanyaan = await this.pertanyaansService.findOne(pertanyaanId);
    res.render('admin/pertanyaan/edit', {user: req.user, pertanyaan})
  }

  @Roles('user')
  @Get('quiz/:pertemuanId/:kelasId')
  async findPertanyaanByPertemuan(@Param('pertemuanId') pertemuanId: number, @Param('kelasId') kelasId: number,@Req() req:any, @Res() res:Response){
    const pertemuan = await this.pertemuanService.findOne(pertemuanId)
    const pertanyaan = await this.pertanyaansService.findPertanyaan(pertemuanId)
    res.render('user/quiz/quiz', {user: req.user, pertanyaan, pertemuan, kelasId})
  }

  @Roles('user')
  @Get('quiz/user/:pertemuanId/:userId')
  async findDetailPertanyaanByPertemuan(@Param('pertemuanId') pertemuanId: number,@Param('userId') userId: number, @Req() req:any, @Res() res:Response){
    const pertemuan = await this.pertemuanService.findOne(pertemuanId)
    const pertanyaan = await this.pertanyaansService.findPertanyaan(pertemuanId)
    const jawaban_user = await this.jawabanUsersService.findJawabanByUser(userId)
    const nilai = await this.jawabanUsersService.AmountNilai(pertemuanId, userId)
    res.render('user/quiz/detail', {user: req.user, pertanyaan, pertemuan, jawaban_user, nilai})
  }

  @Roles('admin')
  @Patch(':pertanyaanId/:quizId')
  async update(@Param('pertanyaanId') pertanyaanId: number, @Param('quizId') quizId: number, @Body() updatePertanyaanDto: UpdatePertanyaanDto, @Req() req:Request, @Res() res:Response) {
    try {
    await this.pertanyaansService.update(pertanyaanId, updatePertanyaanDto);
    req.flash('success', 'successfuly update question')
    res.redirect(`/quiz/${quizId}`)
    } catch (error) {
          req.flash('error', 'unsuccess update question')
    res.redirect(`/quiz/${quizId}`)
    }
  }

  @Roles('admin')
  @Delete(':pertanyaanId/:quizId')
  async remove(@Param('quizId') quizId: number,@Param('pertanyaanId') pertanyaanId: number, @Req() req:Request, @Res() res:Response) {
    try {
          await this.pertanyaansService.remove(pertanyaanId);
          req.flash('success', 'successfuly delete question')
    res.redirect(`/quiz/${quizId}`)
    } catch (error) {
      req.flash('error', 'unsuccess delete question')
    res.redirect(`/quiz/${quizId}`)
    }

  }
}
