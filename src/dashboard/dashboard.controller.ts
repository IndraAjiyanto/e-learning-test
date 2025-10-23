import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request, Response } from 'express';
import {
  Paginate,
  PaginationParams,
} from 'src/common/decorators/pagination.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('')
  async getProtected(@Req() req: Request, @Res() res: Response) {
    const kelas = await this.dashboardService.findAllKelas();
    const pertanyaan_umum = await this.dashboardService.findFAQ();
    const gambar = await this.dashboardService.findGambar();

    if (req.user) {
      if (req.user.role === 'super_admin') {
        res.redirect('/users');
      } else if (req.user.role === 'admin') {
        res.redirect('/kelass');
      } else if (req.user.role === 'user') {
        res.render('dashboard', {
          user: req.user,
          kelas,
          pertanyaan_umum,
          gambar,
        });
      }
    } else {
      res.render('dashboard', {
        user: req.user,
        kelas,
        pertanyaan_umum,
        gambar,
      });
    }
  }

  @Get('kategori/:kategoriName')
  async program(
    @Param('kategoriName') kategoriName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const kelas = await this.dashboardService.findKelasByKategori(kategoriName);
    if (kategoriName === 'Bootcamp') {
      res.render('kelas/bootcamp', { kelas, user: req.user });
    } else if (kategoriName === 'Course') {
      res.render('kelas/course', { kelas, user: req.user });
    } else if (kategoriName === 'Short Class') {
      res.render('kelas/short_class', { kelas, user: req.user });
    }
  }

  @Get('portofolio')
  async portfolio(@Req() req: Request, @Res() res: Response) {
    const kategoriList = await this.dashboardService.findKategori();
    const jenisKelasList = await this.dashboardService.findJenisKelas();

    // Render HTML dengan kategori dan jenis kelas untuk filter
    res.render('portofolio', {
      user: req.user,
      kategori: kategoriList,
      jenis_kelas: jenisKelasList,
    });
  }

  @Get('portofolio/data')
  async portfolioData(
    @Paginate({ defaultLimit: 6 }) pagination: PaginationParams,
  ) {
    // Return JSON data untuk fetch dari frontend
    return await this.dashboardService.paginatePortfolio(pagination);
  }

  @Get('portfolio/:portfolioId')
  async detailPortfolio(
    @Req() req: Request,
    @Res() res: Response,
    @Param('portfolioId') portfolioId: number,
  ) {
    const portfolio = await this.dashboardService.findOnePortfolio(portfolioId);
    res.render('detail_portfolio', { user: req.user, portfolio });
  }

  @Get('alumni')
  async alumni(@Req() req: Request, @Res() res: Response) {
    const kelasList = await this.dashboardService.findAllKelas();
    res.render('alumni', { user: req.user, kelas: kelasList });
  }

  @Get('alumni/data')
  async alumniData(
    @Paginate({ defaultLimit: 6 }) pagination: PaginationParams,
  ) {
    return await this.dashboardService.paginateAlumni(pagination);
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
