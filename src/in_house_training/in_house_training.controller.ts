import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { InHouseTrainingService } from './in_house_training.service';
import { CreateInHouseTrainingDto } from './dto/create-in_house_training.dto';
import { UpdateInHouseTrainingDto } from './dto/update-in_house_training.dto';
import { Request, Response } from 'express';

@Controller('in-house-training')
export class InHouseTrainingController {
  constructor(private readonly inHouseTrainingService: InHouseTrainingService) {}

  @Get()
  async indAll(@Req() req:Request, @Res() res:Response) {
    const kelas = await this.inHouseTrainingService.findAll();
    const jenis_kelas = await this.inHouseTrainingService.findJenisKelas();
    res.render('inhouse', { user: req.user, kelas, jenis_kelas });
  }

}
