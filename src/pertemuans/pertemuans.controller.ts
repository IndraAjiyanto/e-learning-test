import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { PertemuansService } from './pertemuans.service';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { MaterisService } from 'src/materis/materis.service';

@UseGuards(AuthenticatedGuard)
@Controller('pertemuans')
export class PertemuansController {
  constructor(private readonly pertemuansService: PertemuansService, private readonly materisService: MaterisService) {}

  @Roles('admin')
  @Post()
  async create(@Body() createPertemuanDto: CreatePertemuanDto, @Res() res:Response, @Req() req:Request) {
    try {
        createPertemuanDto.pertemuan_ke = await this.pertemuansService.noPertemuan(createPertemuanDto.kelasId)
        await this.pertemuansService.create(createPertemuanDto);
        req.flash('success', 'session succesfuly create')
        res.redirect(`kelass/detail/kelas/admin/${createPertemuanDto.kelasId}`)
    } catch (error) {
              req.flash('error', 'session unsucces create')
        res.redirect(`kelass/detail/kelas/admin/${createPertemuanDto.kelasId}`)
    }

  }

  @Roles('admin')
  @Post(':kelasId')
  async createPertemuan(@Body() createPertemuanDto: CreatePertemuanDto, @Res() res:Response, @Param('kelasId') kelasId:number, @Req() req:Request){
    try {
          createPertemuanDto.kelasId = kelasId
    createPertemuanDto.pertemuan_ke = await this.pertemuansService.noPertemuan(kelasId)
    await this.pertemuansService.create(createPertemuanDto);
    req.flash('success', 'session succesfuly create')
    res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    } catch (error) {
      console.log(error)
              req.flash('error', 'session unsucces create')
    res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    }

  }

  @Roles('admin')
  @Get()
  async findAll(@Res() res:Response, @Req() req:any) {
    const pertemuan = await this.pertemuansService.findAll();
    res.render('admin/pertemuan/index', {user: req.user, pertemuan})
  }

  @Roles('admin')
  @Get('formCreate')
  async formCreate(@Res() res:Response, @Req() req:any){
    const kelas = await this.pertemuansService.findAllKelas()
    res.render('admin/pertemuan/create', {user: req.user, kelas})
  }

  @Roles('admin')
  @Get('formAdd/:id')
  async formAdd(@Res() res:Response, @Req() req:any, @Param('id') id: number){
    res.render('admin/kelas/createPertemuan', {user: req.user, id})
  }

  @Roles('admin')
  @Get('formEdit/:id')
  async formEdit(@Res() res:Response, @Req() req:any, @Param('id') id: number){
    const pertemuan = await this.pertemuansService.findOne(id)
    const kelas = await this.pertemuansService.findAllKelas()
    res.render('admin/pertemuan/edit', {user: req.user, kelas, pertemuan})
  }

  @Roles('admin')
  @Get(':pertemuanId')
  async findOne(@Param('pertemuanId') pertemuanId: number, @Res() res:Response, @Req() req:any) {
    const pertemuan = await this.pertemuansService.findOne(pertemuanId);
    const murid = await this.pertemuansService.findMuridInKelas(pertemuan.kelas.id, pertemuanId)
    const pertanyaan = await this.pertemuansService.findPertanyaan(pertemuanId)
      const materipdf = await this.materisService.findMateriPdf(pertemuanId)
  const materivideo = await this.materisService.findMateriVideo(pertemuanId)
  const materippt = await this.materisService.findMateriPpt(pertemuanId)
    res.render('admin/pertemuan/detail',{user:req.user, pertemuan, murid, pertanyaan, materipdf, materippt, materivideo })
  }

  @Roles('admin')
  @Patch(':pertemuanId')
  async update(@Param('pertemuanId') pertemuanId: number, @Body() updatePertemuanDto: UpdatePertemuanDto, @Res() res:Response, @Req() req:Request) {
    try {
          await this.pertemuansService.update(pertemuanId, updatePertemuanDto);
          req.flash('success', 'Session successfuly update')
    res.redirect(`/pertemuans/${pertemuanId}`)
    } catch (error) {
                req.flash('error', 'Session unsuccess update')
    res.redirect(`/pertemuans/${pertemuanId}`)
    }

  }

  @Roles('admin')
  @Delete(':id/:kelasId')
  async remove(@Param('id') id: number,@Param('kelasId') kelasId: number, @Res() res:Response, @Req() req:Request) {
    try {
          await this.pertemuansService.remove(id, kelasId);
          req.flash('success', 'session successfuly delete')
    res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    } catch (error) {
      req.flash('error', 'session unsucces delete')
    res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    }

  }
}
