import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request, Response } from 'express';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

    @Get('')
  async getProtected(@Req() req: Request, @Res() res: Response) {
    const kelas =  await this.dashboardService.findAllKelas();
    const pertanyaan_umum = await this.dashboardService.findFAQ();
    if(req.user){
    if(req.user.role === "super_admin"){
      res.redirect('/users');
    } else if(req.user.role === "admin"){
      res.redirect('/kelass');
    }else if(req.user.role === "user"){
      res.render('dashboard', { user: req.user, kelas, pertanyaan_umum });
    }
    }else{
      res.render('dashboard', { user: req.user, kelas, pertanyaan_umum });
    }
  }

  @Get('portofoli')
  async portfolio(@Req() req: Request, @Res() res: Response) {
    res.render('portofolio', { user: req.user });
  }

  @Get('alumn')
  async alumni(@Req() req: Request, @Res() res: Response) {
    res.render('alumni', { user: req.user });
  }

  @Get('abou')
  async about(@Req() req: Request, @Res() res: Response) {
    res.render('tentang', { user: req.user });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

}
