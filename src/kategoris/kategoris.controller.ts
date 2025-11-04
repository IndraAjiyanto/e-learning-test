import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('kategoris')
export class KategorisController {
  constructor(private readonly kategorisService: KategorisService) {}

  @Roles('super_admin')
  @Post()
  async create(@Body() createKategorisDto: CreateKategorisDto, @Res() res:Response, @Req() req:Request) {  
    try {
      await this.kategorisService.create(createKategorisDto);
      req.flash('success', 'kategori successfully created')
      res.redirect('/kategoris')
    } catch (error) {
      console.log(error);
      req.flash('error', 'kategori failed to create')
      res.redirect('/kategoris')
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res:Response, @Req() req:Request){
    res.render('super_admin/kategori/create', {user: req.user})
  } 

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res:Response, @Req() req:Request) {
    const kategori = await this.kategorisService.findAll()
    res.render('super_admin/kategori/index', {user: req.user, kategori})
  }

  @Roles('super_admin')
  @Get(':kategoriId')
  async findOne(@Param('kategoriId') kategoriId: number, @Res() res:Response, @Req() req:Request) {
    const kategori = await this.kategorisService.findOne(kategoriId);
    res.render('super_admin/kategori/detail', {user: req.user, kategori})
  }

  @Roles('super_admin')
  @Get('formEdit/:kategoriId')
  async formEdit(@Param('kategoriId') kategoriId: number, @Res() res:Response, @Req() req:Request){
        const kategori = await this.kategorisService.findOne(kategoriId);
    res.render('super_admin/kategori/edit', {user: req.user, kategori})
  }

  @Roles('super_admin')
  @Patch(':kategoriId')
  async update(@Param('kategoriId') kategoriId: number, @Body() updateKategorisDto: UpdateKategorisDto, @Res() res:Response, @Req() req:Request) {
    try {
    await this.kategorisService.update(kategoriId, updateKategorisDto);
    req.flash('success', 'kategori successfully updated')
    res.redirect('/kategoris')
    } catch (error) {
          req.flash('success', 'kategori failed to update')
    res.redirect('/kategoris')
    }
  }

  @Roles('super_admin')
  @Delete(':kategoriId')
  async remove(@Param('kategoriId') kategoriId: number, @Res() res:Response, @Req() req:Request) {
    try {
    await this.kategorisService.remove(kategoriId);
    req.flash('success', 'kategori successfully deleted')
    res.redirect('/kategoris')
    } catch (error) {
          req.flash('success', 'kategori failed to delete')
    res.redirect('/kategoris')
    }
  }

}
