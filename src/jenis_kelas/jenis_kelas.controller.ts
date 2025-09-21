import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { JenisKelasService } from './jenis_kelas.service';
import { CreateJenisKelaDto } from './dto/create-jenis_kela.dto';
import { UpdateJenisKelaDto } from './dto/update-jenis_kela.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('jenis-kelas')
export class JenisKelasController {
  constructor(private readonly jenisKelasService: JenisKelasService) {}

  @Roles('super_admin')
  @Post()
  async create(@Body() createJenisKelaDto: CreateJenisKelaDto, @Res() res:Response, @Req() req:Request) {
    try {
      await this.jenisKelasService.create(createJenisKelaDto);
      req.flash('success','Class type successfully created')
      res.redirect('/jenis-kelas')
    } catch (error) {
      req.flash('success','Class type failed to created')
      res.render('jenis-kelas')
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Req() req:Request, @Res() res:Response){
    const jenis_kelas = await this.jenisKelasService.findAll()
    res.render('super_admin/jenis_kelas/index', {user: req.user, jenis_kelas})
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Req() req:Request, @Res() res:Response) {
    res.render('super_admin/jenis_kelas/create', {user: req.user})
  }

  @Roles('super_admin')
  @Get('formEdit/:jenis_kelasId')
  async formEdit(@Param('jenis_kelasId') jenis_kelasId:number ,@Req() req:Request, @Res() res:Response) {
    const jenis_kelas = await this.jenisKelasService.findOne(jenis_kelasId)
    res.render('super_admin/jenis_kelas/edit', {user: req.user, jenis_kelas})
  }

  @Roles('super_admin')
  @Patch(':jenis_kelasId')
  async update(@Param('jenis_kelasId') jenis_kelasId: number, @Body() updateJenisKelaDto: UpdateJenisKelaDto, @Req() req:Request, @Res() res:Response) {
    try {
     await this.jenisKelasService.update(jenis_kelasId, updateJenisKelaDto);
     req.flash('success', 'Class type successfully update')
     res.redirect('/jenis-kelas')
    } catch (error) {
      req.flash('error', 'Class type failed to updated')
     res.redirect('/jenis-kelas')
    }
  }

  @Roles('super_admin')
  @Delete(':jenis_kelasId')
  async remove(@Param('jenis_kelasId') jenis_kelasId: number, @Req() req:Request, @Res() res:Response) {
    try {
      await this.jenisKelasService.remove(jenis_kelasId);
           req.flash('success', 'Class type successfully delete')
     res.redirect('/jenis-kelas')
    } catch (error) {
                 req.flash('error', 'Class type failed to deleted')
     res.redirect('/jenis-kelas')
    }
  }
}
