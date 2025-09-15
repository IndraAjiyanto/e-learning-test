import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { MingguService } from './minggu.service';
import { CreateMingguDto } from './dto/create-minggu.dto';
import { UpdateMingguDto } from './dto/update-minggu.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('minggu')
export class MingguController {
  constructor(private readonly mingguService: MingguService) {}

  @Roles('admin')
  @Post(':kelasId')
  async create(@Param('kelasId') kelasId: number,@Body() createMingguDto: CreateMingguDto, @Res() res:Response, @Req() req:Request) {
    try {
        createMingguDto.minggu_ke = await this.mingguService.noPertemuan(kelasId)
        await this.mingguService.create(createMingguDto, kelasId);
        req.flash('success', 'session succesfuly create')
        res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    } catch (error) {
              req.flash('error', 'session unsucces create')
        res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    }
  }

  @Roles('admin')
  @Get('formAdd/:id')
  async formAdd(@Res() res:Response, @Req() req:Request, @Param('id') id: number){
    res.render('admin/minggu/create', {user: req.user, id})
  }

  @Roles('admin')
  @Get(':mingguId')
  async findOne(@Param('mingguId') mingguId: number, @Res() res:Response, @Req() req:Request) {
    const minggu = await this.mingguService.findOne(mingguId);
    res.render('admin/minggu/detail', {user: req.user, minggu})
  }

  @Roles('admin')
  @Get('formEdit/:mingguId')
  async formEdit(@Param('mingguId') mingguId:number, @Res() res:Response, @Req() req:Request){
    const minggu = await this.mingguService.findOne(mingguId);
    res.render('admin/minggu/edit', {user: req.user, minggu})
  }

  @Roles('admin')
  @Patch('update/:mingguId')
  async update(@Param('mingguId') mingguId: number, @Body() updateMingguDto: UpdateMingguDto, @Req() req:Request, @Res() res:Response) {
    try {
    await this.mingguService.update(mingguId, updateMingguDto);
    req.flash('success', 'week successfully updated')
    res.redirect(`/minggu/${mingguId}`)
    } catch (error) {
      req.flash('error', 'week failed updated')
      res.redirect(`/minggu/${mingguId}`)
    }
  }

  @Roles('admin')
  @Delete(':id/:kelasId')
  async remove(@Param('id') id: number, @Param('kelasId') kelasId:number, @Res() res:Response, @Req() req:Request ) {
    try {
      await this.mingguService.remove(id, kelasId);
      req.flash('success', 'week successfully deleted')
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    } catch (error) {
      req.flash('error', 'week failed deleted')
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    }
  }
}
