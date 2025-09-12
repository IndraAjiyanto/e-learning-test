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

@UseGuards(AuthenticatedGuard)
@Controller('pertanyaans')
export class PertanyaansController {
constructor(
  private readonly pertanyaansService: PertanyaansService,
  private readonly pertemuanService: PertemuansService,
  private readonly jawabansService: JawabansService,
  private readonly jawabanUsersService: JawabanUsersService,
) {}

@Roles('admin')
@Post(':pertemuanId')
async create(
  @Res() res: Response,
  @Req() req: any,
  @Body() createPertanyaanDto: CreatePertanyaanDto,
  @Param('pertemuanId') pertemuanId: number,
) {
  try {
    createPertanyaanDto.pertemuanId = pertemuanId;
    const pertanyaan = await this.pertanyaansService.create(createPertanyaanDto);
    for (let i = 0; i < createPertanyaanDto.pilihan.length; i++) {
      await this.jawabansService.create({
        pertanyaanId: pertanyaan['id'],
        jawaban: createPertanyaanDto.pilihan[i],
        jawaban_benar: i === Number(createPertanyaanDto.jawaban), 
      });
    }

    req.flash('success', 'Berhasil membuat pertanyaan beserta jawabannya');
    return res.redirect(`/pertemuans/${pertemuanId}`);
  } catch (err) {
    req.flash('error', 'Gagal membuat pertanyaan');
    return res.redirect(`/pertemuans/${pertemuanId}`);
  }
}

  @Roles('admin')
  @Get('Formcreate/:pertemuanId')
  async formCreate(@Req() req:any, @Res() res:Response, @Param('pertemuanId') pertemuanId:number){
    const pertemuan = await this.pertemuanService.findOne(pertemuanId)
    res.render('admin/quiz/create', {user: req.user, pertemuan})
  }

  @Roles('admin')
  @Get('FormEdit/:pertanyaanId')
  async findPertanyaan(@Req() req:Request, @Res() res:Response, @Param('pertanyaanId') pertanyaanId:number) {
    const pertanyaan = await this.pertanyaansService.findOne(pertanyaanId);
    res.render('admin/quiz/edit', {user: req.user, pertanyaan})
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pertanyaansService.findOne(+id);
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
  @Patch(':pertanyaanId/:pertemuanId')
  async update(@Param('pertanyaanId') pertanyaanId: number, @Param('pertemuanId') pertemuanId: number, @Body() updatePertanyaanDto: UpdatePertanyaanDto, @Req() req:Request, @Res() res:Response) {
    try {
    await this.pertanyaansService.update(pertanyaanId, updatePertanyaanDto);
    req.flash('success', 'successfuly update question')
    res.redirect(`/pertemuans/${pertemuanId}`)
    } catch (error) {
          req.flash('error', 'unsuccess update question')
    res.redirect(`/pertemuans/${pertemuanId}`)
    }
  }

  @Roles('admin')
  @Delete(':pertanyaanId/:pertemuanId')
  async remove(@Param('pertemuanId') pertemuanId: number,@Param('pertanyaanId') pertanyaanId: number, @Req() req:Request, @Res() res:Response) {
    try {
          await this.pertanyaansService.remove(pertanyaanId);
          req.flash('success', 'successfuly delete question')
    res.redirect(`/pertemuans/${pertemuanId}`)
    } catch (error) {
      req.flash('error', 'unsuccess delete question')
    res.redirect(`/pertemuans/${pertemuanId}`)
    }

  }
}
