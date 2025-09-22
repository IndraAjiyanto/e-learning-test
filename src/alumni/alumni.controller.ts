import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { CreateAlumnusDto } from './dto/create-alumnus.dto';
import { UpdateAlumnusDto } from './dto/update-alumnus.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';
import { profile } from 'console';

@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Roles('super_admin')
  @Post()
    @UseInterceptors(FileInterceptor('profile', multerConfigImage)) 
  async create(@Body() createAlumnusDto: CreateAlumnusDto, @Res() res:Response, @Req() req:Request, @UploadedFile() profile: Express.Multer.File) {
    try {
      createAlumnusDto.profile = profile.path
      await this.alumniService.create(createAlumnusDto);
      req.flash('success','alumni successfully created')
      res.redirect('/alumni')
    } catch (error) {
            req.flash('error','alumni failed to create')
      res.redirect('/alumni')
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res:Response, @Req() req:Request) {
    const alumni = await this.alumniService.findAll()
    res.render('super_admin/alumni/index', {user: req.user, alumni})
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res:Response, @Req() req:Request){
    const kelas = await this.alumniService.findKelas()
    res.render('super_admin/alumni/create', {user: req.user, kelas})
  }

  @Roles('super_admin')
  @Get('formEdit/:alumniId')
  async formEdit(@Param('alumniId') alumniId: number, @Res() res:Response, @Req() req:Request) {
    const alumni = await this.alumniService.findOne(alumniId);
    const kelas = await this.alumniService.findKelas();
    res.render('super_admin/alumni/edit', {user: req.user, alumni, kelas})
  }

  @Roles('super_admin')
  @Patch(':alumniId')
  @UseInterceptors(FileInterceptor('profile', multerConfigImage)) 
  async update(@UploadedFile() profile: Express.Multer.File, @Param('alumniId') alumniId: number, @Body() updateAlumnusDto: UpdateAlumnusDto, @Res() res:Response, @Req() req:Request) {
    try {
      const alumni = await this.alumniService.findOne(alumniId)
      if (profile) {
      await this.alumniService.getPublicIdFromUrl(alumni.profile);
      updateAlumnusDto.profile = profile.path; 
      } 
      await this.alumniService.update(alumniId, updateAlumnusDto);
      req.flash('success', 'alumni successfully updated')
      res.redirect('/alumni')
    } catch (error) {
            req.flash('error', 'alumni failed to update')
      res.redirect('/alumni')
    }
  }

  @Roles('super_admin')
  @Delete(':alumniId')
  async remove(@Param('alumniId') alumniId: number, @Res() res:Response, @Req() req:Request) {
    try {
      const alumni = await this.alumniService.findOne(alumniId)
      await this.alumniService.getPublicIdFromUrl(alumni.profile)
      await this.alumniService.remove(alumniId);
      req.flash('success', 'alumni successfully remove')
      res.redirect('/alumni')
    } catch (error) {
      req.flash('error', 'alumni failed to remove')
      res.redirect('/alumni')
    }
  }
}
