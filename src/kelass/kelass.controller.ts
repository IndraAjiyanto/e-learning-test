import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards, Req } from '@nestjs/common';
import { KelassService } from './kelass.service';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthenticatedGuard)
@Controller('kelass')
export class KelassController {
  constructor(private readonly kelassService: KelassService) {}

  @Roles('admin')
  @Post()
  async create(@Body() createKelassDto: CreateKelassDto, @Res() res: Response) {
    await this.kelassService.create(createKelassDto);
    return res.redirect('/kelass');
  }

    @Roles('admin')
  @Post('tambahMurid/:kelasId')
  async addUserToKelas( @Param('kelasId') kelasId: number, @Res() res:Response,   @Body('userId') userId: number, ) {
  await this.kelassService.addUserToKelas(userId, kelasId);
  res.redirect('/kelass')
}

  @Roles('admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: any) {
    const kelas = await this.kelassService.allKelas();
    return res.render('kelas/index',{user: req.user, kelas});
  }

  @Roles('admin')
  @Get("/create")
  async formCreate(@Res() res: Response, @Req() req:any){
    return res.render('kelas/create',{user: req.user});
  }

  @Roles('admin')
  @Get("/addUser/:kelasId")
  async formAddUser(@Res() res: Response, @Req() req:any, @Param('kelasId') kelasId:number){
    const users = await this.kelassService.findUser()
    const murid = await this.kelassService.findMurid(kelasId)
    const kelas = await this.kelassService.findOne(kelasId)
    console.log(kelas)
    return res.render('kelas/addUser',{user: req.user, kelas, users, murid});
  }

  @Roles('admin')
  @Get("/edit/:id")
  async formEdit(@Res() res: Response, @Param('id') id: number, @Req() req: any){
    const kelas = await this.kelassService.findOne(id)
    return res.render('kelas/edit', {user: req.user, kelas});
  }

  @Roles('admin','user')
  @Get(':id')
  async detail(@Param('id') id: number, @Res() res: Response, @Req() req: any) {
    const kelas = await this.kelassService.findOne(id);
    const pertemuan = await this.kelassService.findPertemuan(id);
   res.render('kelas/detail', {user: req.user, kelas, pertemuan})
  }

  @Roles('user', 'admin')
  @Get('kelas_saya/:id')
  async myCourse(@Param('id') id: number, @Res() res: Response, @Req() req: any){
    const kelas = await this.kelassService.findMyCourse(id)
    res.render('pengguna/mycourse', {kelas, user: req.user})
  }

  @Roles('admin')
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateKelassDto: UpdateKelassDto, @Res() res: Response) {
    await this.kelassService.update(id, updateKelassDto);
    return res.redirect('/kelass');
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res:Response) {
    await this.kelassService.remove(+id);
    return res.redirect('/kelass');
  }

    @Roles('admin')
  @Delete(':userId/kelas/:kelasId')
  async removeUserKelas(@Param('userId') userId: number, @Param('kelasId') kelasId: number, @Res() res:Response) {
  await this.kelassService.removeUserKelas(userId, kelasId);
  res.redirect('/kelass')
}
}