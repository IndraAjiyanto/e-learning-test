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

  @Get()
  async findAll(@Res() res: Response) {
    const kelas = await this.kelassService.findAll();
    return res.render('kelas/index', { layout: 'layouts/main', kelas });
  }

  @Roles('admin')
  @Get("/create")
  async formCreate(@Res() res: Response){
    return res.render('kelas/create', { layout: 'layouts/main' });
  }

  @Roles('admin')
  @Get("/edit/:id")
  async formEdit(@Res() res: Response, @Param('id') id: number){
    const kelas = await this.kelassService.findOne(id)
    return res.render('kelas/edit', { layout: 'layouts/main', kelas });
  }

  @Get(':id')
  async detail(@Param('id') id: number, @Res() res: Response, @Req() req: any) {
    const kelas = await this.kelassService.findOne(id);
    const pertemuan = await this.kelassService.findPertemuan(id);
   res.render('kelas/detail', {user: req.user, kelas, pertemuan})
  }

  @Roles('user')
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
}
