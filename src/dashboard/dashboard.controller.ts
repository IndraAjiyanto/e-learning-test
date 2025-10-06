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
    const gambar = await this.dashboardService.findGambar()
    if(req.user){
    if(req.user.role === "super_admin"){
      res.redirect('/users');
    } else if(req.user.role === "admin"){
      res.redirect('/kelass');
    }else if(req.user.role === "user"){
      res.render('dashboard', { user: req.user, kelas, pertanyaan_umum, gambar });
    }
    }else{
      res.render('dashboard', { user: req.user, kelas, pertanyaan_umum, gambar });
    }
  }

  @Get('kategori/:kategoriName')
  async program(@Param('kategoriName') kategoriName: string,@Req() req: Request, @Res() res: Response){
    const kelas = await this.dashboardService.findKelasByKategori(kategoriName)
    if(kategoriName === 'Bootcamp'){
    res.render('kelas/bootcamp', {kelas})
    }else if(kategoriName === 'Course'){
    res.render('kelas/course', {kelas})
    }else if(kategoriName === 'Short Class'){
    res.render('kelas/short_class', {kelas})
    }
  }

  @Get('portofolio')
  async portfolio(@Req() req: Request, @Res() res: Response) {
    const portfolio = await this.dashboardService.findPortfolio()
    res.render('portofolio', { user: req.user, portfolio });
  }

  @Get('portfolio/:portfolioId')
  async detailPortfolio(@Req() req: Request, @Res() res: Response, @Param('portfolioId') portfolioId: number){
    const portfolio = await this.dashboardService.findOnePortfolio(portfolioId)
    res.render('detail_portfolio', {user: req.user, portfolio})
  }

  @Get('alumni')
  async alumni(@Req() req: Request, @Res() res: Response) {
    const alumni = await this.dashboardService.findAlumni()
    res.render('alumni', { user: req.user });
  }

  @Get('about')
  async about(@Req() req: Request, @Res() res: Response) {
    res.render('tentang', { user: req.user });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

}
