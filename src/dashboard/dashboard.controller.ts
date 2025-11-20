import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request, Response } from 'express';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getProtected(@Req() req: Request, @Res() res: Response) {
    const kelas = await this.dashboardService.findAllKelas();

    if (req.user) {
      if (req.user.role === 'super_admin') {
        const kelas = await this.dashboardService.findAllKelas()
        res.render('super_admin/kelas/index', { user: req.user, kelas });
      } else if (req.user.role === 'admin') {
        const kelas = await this.dashboardService.findKelasByMentoring(req.user!.id);
        res.render('admin/kelas/index', { user: req.user, kelas });
      } else if (req.user.role === 'user') {
        const pertanyaan_umum = await this.dashboardService.findFAQ();
        const gambar_benefit_1 = await this.dashboardService.findGambar1();
        const gambar_benefit_2 = await this.dashboardService.findGambar2();
        const gambar_benefit_3 = await this.dashboardService.findGambar3();
        const gambar_benefit_4 = await this.dashboardService.findGambar4();
        const jenis_kelas = await this.dashboardService.findJenisKelas();
        const kategori = await this.dashboardService.findKategori();
        const alumni = await this.dashboardService.findAlumni();
        const kerja_sama = await this.dashboardService.findKerjaSama();
        const benefit_1 = await this.dashboardService.findBenefit1();
        const benefit_2 = await this.dashboardService.findBenefit2();
        const benefit_3 = await this.dashboardService.findBenefit3();
        const tentang = await this.dashboardService.findTentang();
        res.render('dashboard', {
          user: req.user,
          kelas,
          pertanyaan_umum,
          gambar_benefit_1,
          gambar_benefit_2,
          gambar_benefit_3,
          gambar_benefit_4,
          jenis_kelas,
          kategori,
          alumni,
          kerja_sama,
          benefit_1,
          benefit_2,
          benefit_3,
          tentang,
        });
      }
    } else {
      const pertanyaan_umum = await this.dashboardService.findFAQ();
      const gambar_benefit_1 = await this.dashboardService.findGambar1();
      const gambar_benefit_2 = await this.dashboardService.findGambar2();
      const gambar_benefit_3 = await this.dashboardService.findGambar3();
      const gambar_benefit_4 = await this.dashboardService.findGambar4();
      const jenis_kelas = await this.dashboardService.findJenisKelas();
      const kategori = await this.dashboardService.findKategori();
      const alumni = await this.dashboardService.findAlumni();
      const kerja_sama = await this.dashboardService.findKerjaSama();
      const benefit_1 = await this.dashboardService.findBenefit1();
      const benefit_2 = await this.dashboardService.findBenefit2();
      const benefit_3 = await this.dashboardService.findBenefit3();
      const tentang = await this.dashboardService.findTentang();
      res.render('dashboard', {
        user: req.user,
        kelas,
        pertanyaan_umum,
        gambar_benefit_1,
        gambar_benefit_2,
        gambar_benefit_3,
        gambar_benefit_4,
        jenis_kelas,
        kategori,
        alumni,
        kerja_sama,
        benefit_1,
        benefit_2,
        benefit_3,
        tentang,
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
    const jenis_kelas = await this.dashboardService.findJenisKelas();
    if (kategoriName === 'Bootcamp') {
      res.render('kelas/bootcamp', { kelas, user: req.user, jenis_kelas });
    } else if (kategoriName === 'Course') {
      res.render('kelas/course', { kelas, user: req.user, jenis_kelas });
    } else if (kategoriName === 'Short Class') {
      res.render('kelas/short_class', { kelas, user: req.user, jenis_kelas });
    } else if (kategoriName === 'in_house_training') {
      res.render('inhouse', { kelas, user: req.user, jenis_kelas });
    } else if (kategoriName === 'wip') {
      res.render('wip', { kelas, user: req.user, jenis_kelas });
    }
  }

  @Get('portofolio')
  async portfolio(@Req() req: Request, @Res() res: Response) {
    // Ambil semua data sekaligus
    const portfolioList = await this.dashboardService.findPortfolio();
    const kategoriList = await this.dashboardService.findKategori();
    const jenisKelasList = await this.dashboardService.findJenisKelas();

    res.render('portofolio', {
      user: req.user,
      portfolio: portfolioList,
      kategori: kategoriList,
      jenis_kelas: jenisKelasList,
    });
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
    // Ambil semua data sekaligus
    const alumniList = await this.dashboardService.findAlumni();
    const kelasList = await this.dashboardService.findKelas();

    res.render('alumni', {
      user: req.user,
      alumni: alumniList,
      kelas: kelasList,
    });
  }

  @Get('about')
  async about(@Req() req: Request, @Res() res: Response) {
    const team = await this.dashboardService.findTeam();
    const social = await this.dashboardService.findSocial();
    const visi = await this.dashboardService.findVisiMisi();
    const commitment = await this.dashboardService.findCommitment();
    const value = await this.dashboardService.findValue();
    const teamLead = await this.dashboardService.findTeamLead();
    const misi = await this.dashboardService.findMisi();
    const experience = await this.dashboardService.findExperience();
    const award = await this.dashboardService.findAward();
    const background = await this.dashboardService.findBackground();
    const paragraf = await this.dashboardService.findTentangParagraf();
    res.render('tentang', {
      user: req.user,
      team,
      social,
      visi,
      commitment,
      value,
      teamLead,
      misi,
      experience,
      award,
      background,
      paragraf,
    });
  }
}
