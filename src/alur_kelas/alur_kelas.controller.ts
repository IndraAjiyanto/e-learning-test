import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { AlurKelasService } from './alur_kelas.service';
import { CreateAlurKelaDto } from './dto/create-alur_kela.dto';
import { UpdateAlurKelaDto } from './dto/update-alur_kela.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('alur-kelas')
export class AlurKelasController {
  constructor(private readonly alurKelasService: AlurKelasService) {}

  @Roles('super_admin')
  @Post(':kategoriId')
  async create(@Param('kategoriId') kategoriId:number ,@Body() createAlurKelaDto: CreateAlurKelaDto, @Res() res:Response, @Req() req:Request) {
    try {
      createAlurKelaDto.kategoriId = kategoriId
      createAlurKelaDto.alur_ke = await this.alurKelasService.noAlur(kategoriId)
    await this.alurKelasService.create(createAlurKelaDto);
    req.flash('success', 'alur kelas successfully created')
    res.redirect(`/kategoris/${kategoriId}`)
    } catch (error) {
      req.flash('error', 'alur kelas failed to create')
      res.redirect(`/kategoris/${kategoriId}`)
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:kategoriId')
  async formCreate(@Param('kategoriId') kategoriId: number,@Res() res:Response, @Req() req:Request){
    res.render('super_admin/alur_kelas/create', {user: req.user, kategoriId})
  }

  @Roles('super_admin')
  @Get('formEdit/:alurKelasId')
  async formEdit(@Param('alurKelasId') alurKelasId: number, @Res() res:Response, @Req() req:Request) {
    const alur_kelas = await this.alurKelasService.findOne(alurKelasId)
    res.render('super_admin/alur_kelas/edit', {user: req.user, alur_kelas})
  }

  @Roles('super_admin')
  @Patch(':alurKelasId/:kategoriId')
  async update(@Param('alurKelasId') alurKelasId: number, @Param('kategoriId') kategoriId: number, @Body() updateAlurKelaDto: UpdateAlurKelaDto, @Res() res:Response, @Req() req:Request) {
    try {
      await this.alurKelasService.update(alurKelasId,updateAlurKelaDto)
      req.flash('success', 'alur kelas successfully updated')
      res.redirect(`/kategoris/${kategoriId}`)
    } catch (error) {
      req.flash('error', 'alur kelas failed to update')
      res.redirect(`/kategoris/${kategoriId}`)
    }
  }

  @Roles('super_admin')
  @Delete(':alurKelasId/:kategoriId')
  async remove(@Param('alurKelasId') alurKelasId: number, @Param('kategoriId') kategoriId: number, @Res() res:Response, @Req() req:Request) {
    try {
      await this.alurKelasService.remove(alurKelasId, kategoriId)
      req.flash('success','alur kelas successfully delete')
      res.redirect(`/kategoris/${kategoriId}`)
    } catch (error) {
      req.flash('error','alur kelas failed to delete')
      res.redirect(`/kategoris/${kategoriId}`)
    }
  }
}
