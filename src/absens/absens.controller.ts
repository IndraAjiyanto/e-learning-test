import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { AbsensService } from './absens.service';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { UpdateAbsenDto } from './dto/update-absen.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('absens')
export class AbsensController {
  constructor(private readonly absensService: AbsensService) {}

  @Roles('user')
  @Post(':pertemuanId/:userId/:kelasId')
  async create(@Param('pertemuanId') pertemuanId: number,@Param('kelasId') kelasId: number, @Param('userId') userId: number,@Res() res: Response,@Body() createAbsenDto: CreateAbsenDto, @Req() req: any) {
    createAbsenDto.pertemuanId = pertemuanId
    createAbsenDto.userId = userId
    await this.absensService.create(createAbsenDto);
    res.redirect(`/kelass/${kelasId}`)
  }

  @Roles('admin')
  @Post()
  async createAbsen(@Res() res: Response,@Body() createAbsenDto: CreateAbsenDto, @Req() req: any) {
    createAbsenDto.waktu_absen = new Date()
    await this.absensService.create(createAbsenDto);
    res.redirect('/absens')
  }

  @Roles('user')
  @Get('form/:id')
  async formAbsen(@Res() res: Response, @Param('id') id: number,  @Req() req: any){
    const pertemuan = await this.absensService.findPertemuan(id);
    res.render('user/absen/create',{pertemuan, user: req.user})
  }

  @Roles('admin')
  @Get()
  async findAll(@Res() res: Response,  @Req() req: any) {
    const absen = await this.absensService.findAll();
    res.render('admin/absen/index', {user: req.user, absen})
  }

  @Roles('admin')
  @Get('create')
  async absenCreate(@Res() res: Response,  @Req() req: any){
    const kelas = await this.absensService.findKelas()
    const users = await this.absensService.findUsers()
    res.render('admin/absen/create', {user: req.user, kelas, users})
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res:Response, @Req() req:any) {
    const absen = await this.absensService.findOne(id);
    console.log(absen)
    res.render('admin/absen/detail', {user: req.user, absen})
  }

  @Roles('user')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAbsenDto: UpdateAbsenDto) {
    return this.absensService.update(+id, updateAbsenDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.absensService.remove(+id);
  }
}
