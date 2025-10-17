import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { SertifikatService } from './sertifikat.service';
import { CreateSertifikatDto } from './dto/create-sertifikat.dto';
import { UpdateSertifikatDto } from './dto/update-sertifikat.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('sertifikat')
export class SertifikatController {
  constructor(private readonly sertifikatService: SertifikatService) {}

  @Roles('user')
    @Get(':kelasId')
  async generate(@Param('kelasId') kelasId: number, @Res() res: Response, @Req() req:Request) {
    if(req.user){
      const biodata = await this.sertifikatService.findBiodata(req.user.id)
      if(!biodata){
        req.flash('info','isi biodata terlebih dahulu')
        res.redirect('/users/profile')
      }else{
      const sertifikat = await this.sertifikatService.generateCertificate(kelasId, req.user.id);
      res.render('user/sertifikat/detail', {user: req.user, sertifikat})
      }
    } 
  }

  @Post()
  create(@Body() createSertifikatDto: CreateSertifikatDto) {
    return this.sertifikatService.create(createSertifikatDto);
  }

  @Get()
  findAll() {
    return this.sertifikatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sertifikatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSertifikatDto: UpdateSertifikatDto) {
    return this.sertifikatService.update(+id, updateSertifikatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sertifikatService.remove(+id);
  }
}
