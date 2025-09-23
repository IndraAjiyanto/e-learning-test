import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { JawabanTugassService } from './jawaban_tugass.service';
import { CreateJawabanTugassDto } from './dto/create-jawaban_tugass.dto';
import { UpdateJawabanTugassDto } from './dto/update-jawaban_tugass.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('jawaban-tugass')
export class JawabanTugassController {
  constructor(private readonly jawabanTugassService: JawabanTugassService) {}

  @Roles('user')
  @Post(':tugasId/:pertemuanId')
  async create(@Param('tugasId') tugasId:number,@Param('pertemuanId') pertemuanId:number,  @Body() createJawabanTugassDto: CreateJawabanTugassDto, @Req() req:Request, @Res() res:Response) {
    try {
    
    createJawabanTugassDto.proses = 'proces'
    createJawabanTugassDto.nilai = 0
    if(req.user){
    createJawabanTugassDto.userId = req.user.id
    }
    createJawabanTugassDto.tugasId = tugasId
    await this.jawabanTugassService.create(createJawabanTugassDto);
    req.flash('success', 'submission successfuly send')
    res.redirect(`/jawaban-tugass/${pertemuanId}/${tugasId}`)
    } catch (error) {
          req.flash('error', 'submission unsuccess send')
    res.redirect(`/jawaban-tugass/${pertemuanId}/${tugasId}`)
    }

  }

  @Roles('user')
  @Get(':pertemuanId/:tugasId')
  async findJawaban(@Param('tugasId') tugasId:number, @Param('pertemuanId') pertemuanId: number, @Req() req:Request, @Res() res: Response) {
      if(req.user){
      const tugas = await this.jawabanTugassService.findTugas(tugasId)
      const jawaban_tugas = await this.jawabanTugassService.findJawabanTugas(req.user.id,tugasId)
      const jawabanExists = await this.jawabanTugassService.findJawabanExists(req.user.id,tugasId)
      res.render('user/tugas', {user: req.user, tugas, jawaban_tugas, jawabanExists})
      }
  }

  @Roles('admin')
  @Get(':tugasId')
  async findOne(@Param('tugasId') tugasId: number, @Req() req:Request, @Res() res:Response) {
    const tugas = await this.jawabanTugassService.findTugas(tugasId)
    const jawaban_tugas =  await this.jawabanTugassService.findAllJawabanTugas(tugasId)
    res.render('admin/jawaban-tugas/index', {user: req.user, jawaban_tugas, tugas})
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJawabanTugassDto: UpdateJawabanTugassDto) {
    return this.jawabanTugassService.update(+id, updateJawabanTugassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jawabanTugassService.remove(+id);
  }
}
