import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { WipService } from './wip.service';
import { CreateWipDto } from './dto/create-wip.dto';
import { UpdateWipDto } from './dto/update-wip.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('wip')
export class WipController {
  constructor(private readonly wipService: WipService) {}

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response,) {
    const kelas = await this.wipService.findAll();
    const jenis_kelas = await this.wipService.findJenisKelas();
    res.render('wip',{kelas, jenis_kelas, user: req.user})
  }
}
