import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request, Response } from 'express';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('course/filter')
  async kelasFilter(
    @Req() req: Request,
    @Res() res: Response,
    @Query('userId') userId?: number,
    @Query('category') category?: string,
    @Query('courseType') jenisKelas?: string,
    @Query('metode') metode?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = parseInt(page || '1', 10);
    const itemsPerPage = parseInt(limit || '6', 10);

    const result = await this.dashboardService.findCoursesPaginated({
      userId: userId || undefined,
      category: category || undefined,
      jenisKelas: jenisKelas || undefined,
      metode: metode || undefined,
      search: search || undefined,
      page: currentPage,
      limit: itemsPerPage,
    });

    return res.json({
      data: result.data,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / itemsPerPage),
      currentPage,
    });
  }

  @Get()
  async getProtected(@Req() req: Request, @Res() res: Response) {
    // const course = await this.dashboardService.findAllCourses();

    if (req.user) {
      if (req.user.role === 'super_admin') {
        res.redirect('/users');
      } else if (req.user.role === 'admin') {
        res.redirect('/program');
      } else if (req.user.role === 'user') {
        const our_experience = await this.dashboardService.findOurExperience();
        const special_program =
          await this.dashboardService.findSpecialProgram();
        const faq = await this.dashboardService.findFAQ();
        const image_benefit_1 = await this.dashboardService.findImage1();
        const image_benefit_2 = await this.dashboardService.findImage2();
        const image_benefit_3 = await this.dashboardService.findImage3();
        const image_benefit_4 = await this.dashboardService.findImage4();
        const courseType = await this.dashboardService.findCourseTypes();
        const category = await this.dashboardService.findCategories();
        const alumni = await this.dashboardService.findAllAlumni();
        const collaborations = await this.dashboardService.findCollaborations();
        const benefit_1 = await this.dashboardService.findBenefit1();
        const benefit_2 = await this.dashboardService.findBenefit2();
        const benefit_3 = await this.dashboardService.findBenefit3();
        const about = await this.dashboardService.findAbout();
        const social = await this.dashboardService.findSocial();
        res.render('dashboard', {
          special_program,
          user: req.user,
          // course,
          faq,
          image_benefit_1,
          image_benefit_2,
          image_benefit_3,
          image_benefit_4,
          courseType,
          category,
          alumni,
          collaborations,
          benefit_1,
          benefit_2,
          benefit_3,
          about,
          social,
          our_experience,
        });
      }
    } else {
      const our_experience = await this.dashboardService.findOurExperience();
      const special_program = await this.dashboardService.findSpecialProgram();
      const faq = await this.dashboardService.findFAQ();
      const image_benefit_1 = await this.dashboardService.findImage1();
      const image_benefit_2 = await this.dashboardService.findImage2();
      const image_benefit_3 = await this.dashboardService.findImage3();
      const image_benefit_4 = await this.dashboardService.findImage4();
      const courseType = await this.dashboardService.findCourseTypes();
      const category = await this.dashboardService.findCategories();
      const alumni = await this.dashboardService.findAllAlumni();
      const collaborations = await this.dashboardService.findCollaborations();
      const benefit_1 = await this.dashboardService.findBenefit1();
      const benefit_2 = await this.dashboardService.findBenefit2();
      const benefit_3 = await this.dashboardService.findBenefit3();
      const about = await this.dashboardService.findAbout();
      const social = await this.dashboardService.findSocial();
      res.render('dashboard', {
        special_program,
        user: req.user,
        // course,
        faq,
        image_benefit_1,
        image_benefit_2,
        image_benefit_3,
        image_benefit_4,
        courseType,
        category,
        alumni,
        collaborations,
        benefit_1,
        benefit_2,
        benefit_3,
        about,
        social,
        our_experience,
      });
    }
  }

  @Get('portofolios/filter')
  async portfolioFilter(
    @Req() req: Request,
    @Res() res: Response,
    @Query('userId') userId?: number,
    @Query('kategori_id') categoryId?: string,
    @Query('jenis_kelas_id') courseTypeId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = parseInt(page || '1', 10);
    const itemsPerPage = parseInt(limit || '6', 10);
  
    const portfolioList = await this.dashboardService.findPortfolio({
      userId: userId || null,
      categoryId: categoryId || null,
      courseTypeId: courseTypeId || null,
      page: currentPage,
      limit: itemsPerPage,
    });

  
    return res.json({
      data: portfolioList.data,
      totalItems: portfolioList.total,
      totalPages: Math.ceil(portfolioList.total / itemsPerPage),
      currentPage,
    });
  }

  @Get('portofolios')
  async portfolio(@Req() req: Request, @Res() res: Response) {
    // const portfolioList = await this.dashboardService.findPortfolio();
    const kategoriList = await this.dashboardService.findCategories();
    const jenisKelasList = await this.dashboardService.findCourseTypes();

    res.render('portofolios', {
      user: req.user,
      // portfolio: portfolioList,
      category: kategoriList,
      courseType: jenisKelasList,
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

  @Get('alumni/filter')
  async alumniFilter(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search?: string,         
    @Query('kelas_id') courseId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = parseInt(page || '1', 10);
    const itemsPerPage = parseInt(limit || '6', 10);

    const result = await this.dashboardService.findAlumni({
      courseId: courseId || null,
      search: search || null, 
      page: currentPage,
      limit: itemsPerPage,
    });

    return res.json({
      data: result.data,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / itemsPerPage),
      currentPage,
    });
  }

  @Get('alumni')
  async alumni(@Req() req: Request, @Res() res: Response) {
    const kelasList = await this.dashboardService.findCourses();

    res.render('alumni', {
      user: req.user,
      course: kelasList,
      // kategoriList: kategoriList 
    });
  }

  @Get('about')
  async about(@Req() req: Request, @Res() res: Response) {
    const team = await this.dashboardService.findTeam();
    const social = await this.dashboardService.findSocial();
    const visions = await this.dashboardService.findVisionsMissions();
    const commitment = await this.dashboardService.findCommitment();
    const value = await this.dashboardService.findValue();
    const teamLead = await this.dashboardService.findTeamLead();
    const mission = await this.dashboardService.findMission();
    const experience = await this.dashboardService.findExperience();
    const award = await this.dashboardService.findAward();
    const background = await this.dashboardService.findBackground();
    const paragraphs = await this.dashboardService.findAboutParagraphs();
    res.render('about', {
      user: req.user,
      team,
      social,
      visions,
      commitment,
      value,
      teamLead,
      mission,
      experience,
      award,
      background,
      paragraphs,
    });
  }

  @Get('api/category')
  async getKategori(@Res() res: Response) {
    const category = await this.dashboardService.findCategories();
    res.json(category);
  }
}
