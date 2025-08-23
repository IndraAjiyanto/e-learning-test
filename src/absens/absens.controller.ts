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
    createAbsenDto.waktu_absen = new Date()
    await this.absensService.create(createAbsenDto);
    res.redirect(`/kelass/${kelasId}`)
  }

  @Roles('admin')
  @Post(':pertemuanId')
  async createAbsen(@Param('pertemuanId') pertemuanId: number, @Res() res: Response,@Body() createAbsenDto: CreateAbsenDto, @Req() req: any) {
    createAbsenDto.pertemuanId = pertemuanId
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
  @Get('create/:pertemuanId')
  async absenCreate(@Res() res: Response,  @Req() req: any, @Param('pertemuanId') pertemuanId: number){
    const users = await this.absensService.findUsers(pertemuanId)
    res.render('admin/absen/create', {user: req.user, users, pertemuanId})
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res:Response, @Req() req:any) {
    const absen = await this.absensService.findOne(id);
    res.render('admin/absen/detail', {user: req.user, absen})
  }

  @Roles('admin')
  @Get('formEdit/:id')
  async formEdit(@Param('id') id: number, @Res() res:Response, @Req() req:any){
    const absen = await this.absensService.findOne(id);
    res.render('admin/absen/edit', {user: req.user, absen})
  }

  @Roles('user', 'admin')
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateAbsenDto: UpdateAbsenDto, @Res() res:Response, @Req() req:any) {
    await this.absensService.update(id, updateAbsenDto);
    res.redirect('/absens')
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res:Response, @Req() req:any) {
    await this.absensService.remove(id);
    res.redirect('/absens')
  }
}
