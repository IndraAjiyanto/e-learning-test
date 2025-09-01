import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { PertanyaansService } from './pertanyaans.service';
import { CreatePertanyaanDto } from './dto/create-pertanyaan.dto';
import { UpdatePertanyaanDto } from './dto/update-pertanyaan.dto';
import { Response } from 'express';
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
    console.log(createPertanyaanDto)
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
    console.error(err);
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
  @Get(':pertemuanId')
  async findPertanyaan(@Req() req:any, @Res() res:Response, @Param('pertemuanId') pertemuanId:number) {
    const pertanyaan = await this.pertanyaansService.findPertanyaan(pertemuanId);
    res.render('admin/quiz/index', {user: req.user, pertanyaan})
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pertanyaansService.findOne(+id);
  }

  @Roles('user')
  @Get('quiz/:pertemuanId')
  async findPertanyaanByPertemuan(@Param('pertemuanId') pertemuanId: number, @Req() req:any, @Res() res:Response){
    const pertemuan = await this.pertemuanService.findOne(pertemuanId)
    const pertanyaan = await this.pertanyaansService.findPertanyaan(pertemuanId)
    res.render('user/quiz/quiz', {user: req.user, pertanyaan, pertemuan})
  }

  @Roles('user')
  @Get('quiz/:pertemuanId/:userId')
  async findDetailPertanyaanByPertemuan(@Param('pertemuanId') pertemuanId: number,@Param('userId') userId: number, @Req() req:any, @Res() res:Response){
    const pertemuan = await this.pertemuanService.findOne(pertemuanId)
    const pertanyaan = await this.pertanyaansService.findPertanyaan(pertemuanId)
    const jawaban_user = await this.jawabanUsersService.findJawabanByUser(userId)
    const nilai = await this.jawabanUsersService.AmountNilai(pertemuanId, userId)
    console.log(jawaban_user)
    res.render('user/quiz/detail', {user: req.user, pertanyaan, pertemuan, jawaban_user, nilai})
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePertanyaanDto: UpdatePertanyaanDto) {
    return this.pertanyaansService.update(+id, updatePertanyaanDto);
  }

  @Roles('admin')
  @Delete(':pertanyaanId/:pertemuanId')
  async remove(@Param('pertemuanId') pertemuanId: number,@Param('pertanyaanId') pertanyaanId: number, @Req() req:any, @Res() res:Response) {
    await this.pertanyaansService.remove(pertanyaanId);
    res.redirect(`/pertemuans/${pertemuanId}`)
  }
}
