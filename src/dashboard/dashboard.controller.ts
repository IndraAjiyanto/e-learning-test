import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request, Response } from 'express';
import { FilterPortfolioDto } from './dto/filter-portfolio.dto';

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
    res.render('kelas/bootcamp', {kelas, user:req.user})
    }else if(kategoriName === 'Course'){
    res.render('kelas/course', {kelas, user:req.user})
    }else if(kategoriName === 'Short Class'){
    res.render('kelas/short_class', {kelas, user:req.user})
    }
  }

@Get('portofolio')
  async portfolio(
    @Req() req: Request,
    @Res() res: Response,
    @Query() filter: FilterPortfolioDto,
  ) {
  const { kategori, jenis_kelas, page, limit } = filter;

  const portfolio = await this.dashboardService.paginatePortfolio({ kategori, jenis_kelas, page, limit });
    const kategoriList = await this.dashboardService.findKategori();
    const jenisKelasList = await this.dashboardService.findJenisKelas();

    console.log(portfolio)

    res.render('portofolio', {
      user: req.user,
      portfolio,
      kategori: kategoriList,
      jenis_kelas: jenisKelasList,
      selectedKategori: kategori,
      selectedJenisKelas: jenis_kelas,
    });
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
