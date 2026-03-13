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
        res.redirect('/users');
      } else if (req.user.role === 'admin') {
        res.redirect('/kelass');
      } else if (req.user.role === 'user') {
        const our_experience = await this.dashboardService.findOurExperience();
        const special_program =
          await this.dashboardService.findSpecialProgram();
        const faq = await this.dashboardService.findFAQ();
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
        const social = await this.dashboardService.findSocial();
        res.render('dashboard', {
          special_program,
          user: req.user,
          kelas,
          faq,
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
          social,
          our_experience,
        });
      }
    } else {
      const our_experience = await this.dashboardService.findOurExperience();
      const special_program = await this.dashboardService.findSpecialProgram();
      const faq = await this.dashboardService.findFAQ();
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
      const social = await this.dashboardService.findSocial();
      res.render('dashboard', {
        special_program,
        user: req.user,
        kelas,
        faq,
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
        social,
        our_experience,
      });
    }
  }

  @Get('portofolio')
  async portfolio(@Req() req: Request, @Res() res: Response) {
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
    const alumniList = await this.dashboardService.findAlumni();
    const kelasList = await this.dashboardService.findKelas();

    res.render('alumni', {
      user: req.user,
      alumni: alumniList,
      kelas: kelasList,
    });
  }

  @Get('blog')
  async blog(@Req() req: Request, @Res() res: Response) {
    const blog_tranding = await this.dashboardService.findBlogTrending();
    const kategori_tranding = await this.dashboardService.findKategoriTrending();
    if (blog_tranding !== null) {
      const blog = await this.dashboardService.findBlog();
      const kategori_blog = await this.dashboardService.findBlogCategory();
      res.render('blog', {
        user: req.user,
        blog,
        kategori_blog,
        blog_tranding,
        kategori_tranding
      });
    } else {
      const blog = await this.dashboardService.findBlog();
      const kategori_blog = await this.dashboardService.findBlogCategory();
      res.render('blog', {
        user: req.user,
        blog,
        kategori_blog,
        blog_tranding,
        kategori_tranding
      });
    }
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

  @Get('api/kategori')
  async getKategori(@Res() res: Response) {
    const kategori = await this.dashboardService.findKategori();
    res.json(kategori);
  }
}
