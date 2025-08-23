import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { KelassService } from './kelass.service';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';

@Controller('kelass')
export class KelassController {
  constructor(private readonly kelassService: KelassService) {}

  @Roles('admin', 'super_admin')
  @Post()
  @UseInterceptors(FileInterceptor('gambar', multerConfigImage)) 
  async create(@Body() createKelassDto: CreateKelassDto, @Res() res: Response, @UploadedFile() gambar: Express.Multer.File) {
    createKelassDto.gambar = gambar.filename
    await this.kelassService.create(createKelassDto);
    return res.redirect('/kelass');
  }

  @Roles('admin')
  @Post('tambahMurid/:kelasId')
  async addUserToKelas( @Param('kelasId') kelasId: number, @Res() res:Response,   @Body('userId') userId: number, ) {
  await this.kelassService.addUserToKelas(userId, kelasId);
  res.redirect('/kelass')
  }

  @Roles('admin', 'super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: any) {
    const kelas = await this.kelassService.allKelas();
    return res.render('admin/kelas/index',{user: req.user, kelas});
  }

  @Roles('admin', 'super_admin')
  @Get("/create")
  async formCreate(@Res() res: Response, @Req() req:any){
    return res.render('admin/kelas/create',{user: req.user});
  }

  @Roles('admin')
  @Get("/addUser/:kelasId")
  async formAddUser(@Res() res: Response, @Req() req:any, @Param('kelasId') kelasId:number){
    const users = await this.kelassService.findUser()
    const murid = await this.kelassService.findMurid(kelasId)
    const kelas = await this.kelassService.findOne(kelasId)
    return res.render('admin/kelas/addUser',{user: req.user, kelas, users, murid});
  }

  @Roles('admin', 'super_admin')
  @Get("/edit/:id")
  async formEdit(@Res() res: Response, @Param('id') id: number, @Req() req: any){
    const kelas = await this.kelassService.findOne(id)
    return res.render('admin/kelas/edit', {user: req.user, kelas});
  }

  @Roles('admin')
  @Get("/detail/kelas/admin/:id")
  async detailKelas(@Param('id') id: number, @Res() res: Response, @Req() req: any){
    const kelas = await this.kelassService.findOne(id);
    const pertemuan = await this.kelassService.findPertemuan(id);
    res.render('admin/kelas/detail', {user: req.user, kelas, pertemuan})
  }

  @Get(':id')
  async detail(@Param('id') id: number, @Res() res: Response, @Req() req: any) {
    const kelas = await this.kelassService.findOne(id);
    const pertemuan = await this.kelassService.findPertemuan(id);
  let isUserInKelas = false;
  if(!kelas){
    return "tidak ada kelas"
  }else if(!req.user){
    res.render('kelas/Bdetail', { kelas});
  } else {
          for (const u of kelas.user) {
    if (u.id === req.user.id) {
      isUserInKelas = true;
      break;
    }
  }
    if (isUserInKelas) {
    res.render('kelas/detail', { user: req.user, kelas, pertemuan });
  } else {
    res.render('kelas/Bdetail', {user: req.user, kelas});
  }
  }
  }

  @Roles('user')
  @Get('kelas_saya/:id')
  async myCourse(@Param('id') id: number, @Res() res: Response, @Req() req: any){
    const kelas = await this.kelassService.findMyCourse(id)
    res.render('user/mycourse', {kelas, user: req.user})
  }

  @Roles('admin', 'super_admin')
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateKelassDto: UpdateKelassDto, @Res() res: Response) {
    await this.kelassService.update(id, updateKelassDto);
    return res.redirect('/kelass');
  }

  @Roles('admin', 'super_admin')
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res:Response) {
    await this.kelassService.remove(id);
    return res.redirect('/kelass');
  }

  @Roles('admin')
  @Delete(':userId/kelas/:kelasId')
  async removeUserKelas(@Param('userId') userId: number, @Param('kelasId') kelasId: number, @Res() res:Response) {
  await this.kelassService.removeUserKelas(userId, kelasId);
  res.redirect('/kelass')
}
}