import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { KelassService } from './kelass.service';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { Response } from 'express';

@Controller('kelass')
export class KelassController {
  constructor(private readonly kelassService: KelassService) {}

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

  @Get("/create")
  async formCreate(@Res() res: Response){
    return res.render('kelas/create', { layout: 'layouts/main' });
  }

  @Get("/edit/:id")
  async formEdit(@Res() res: Response, @Param('id') id: number){
    const kelas = await this.kelassService.findOne(id)
    return res.render('kelas/edit', { layout: 'layouts/main', kelas });
  }

  @Get(':id')
  async detail(@Param('id') id: string, @Res() res: Response) {
    const kelas = await this.kelassService.findOne(+id);
    return res.render('kelas/detail', { layout: 'layouts/main', kelas })
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateKelassDto: UpdateKelassDto, @Res() res: Response) {
    await this.kelassService.update(+id, updateKelassDto);
    return res.redirect('/kelass');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res:Response) {
    await this.kelassService.remove(+id);
    return res.redirect('/kelass');
  }
}
