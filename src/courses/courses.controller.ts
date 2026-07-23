import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseInterceptors,
  UploadedFile,
  UseFilters,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCoursesDto } from './dto/create-courses.dto';
import { UpdateCoursesDto } from './dto/update-courses.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('program')
export class CoursesController {
  constructor(private readonly kelassService: CoursesService) { }

  @Roles('admin', 'super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'program',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async create(
    @Body() createKelassDto: CreateCoursesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createKelassDto.image = req.body.uploadedImageUrls?.[0];

      if (createKelassDto.month) {
        createKelassDto.day = 0;
      }

      if (createKelassDto.day) {
        createKelassDto.month = 0;
      }

      if (createKelassDto.paid_check === 'true') {
        createKelassDto.form = '';
        createKelassDto.check_paid = true;
        if (req.user!.role === 'super_admin') {
          createKelassDto.process = 'acc';
        } else if (req.user!.role === 'admin') {
          createKelassDto.process = 'proces';
        }
      } else if (createKelassDto.paid_check === 'false') {
        createKelassDto.check_paid = false;
        createKelassDto.price = 0;
        createKelassDto.promo = 0;
        if (req.user!.role === 'super_admin') {
          createKelassDto.process = 'acc';
        } else if (req.user!.role === 'admin') {
          createKelassDto.process = 'proces';
        }
      }
      const course = await this.kelassService.create(createKelassDto);
      if (req.user!.role === 'super_admin') {
        await this.kelassService.createMentoring(
          createKelassDto.mentoringsId,
          course.id,
        );
      }
      if (req.user!.role === 'admin') {
        await this.kelassService.createMentoring(req.user!.id, course.id);
      }
      req.flash('success', 'program successfully created');
      res.redirect('/program');
    } catch (error: any) {
      req.flash('error', error.message || 'program failed created');
      res.redirect('/program');
    }
  }

  @Roles('admin', 'super_admin')
  @Post(':categoryId')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'program',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async createKelas(
    @Body() createKelassDto: CreateCoursesDto,
    @Res() res: Response,
    @Req() req: Request,
    @Param('categoryId') categoryId: number,
  ) {
    try {
      createKelassDto.image = req.body.uploadedImageUrls?.[0];

      if (createKelassDto.month) {
        createKelassDto.day = 0;
      }

      if (createKelassDto.day) {
        createKelassDto.month = 0;
      }

      if (createKelassDto.paid_check === 'true') {
        createKelassDto.form = '';
        createKelassDto.check_paid = true;
        if (req.user!.role === 'super_admin') {
          createKelassDto.process = 'acc';
        } else if (req.user!.role === 'admin') {
          createKelassDto.process = 'proces';
        }
      } else if (createKelassDto.paid_check === 'false') {
        createKelassDto.check_paid = false;
        createKelassDto.price = 0;
        createKelassDto.promo = 0;
        if (req.user!.role === 'super_admin') {
          createKelassDto.process = 'acc';
        } else if (req.user!.role === 'admin') {
          createKelassDto.process = 'proces';
        }
      }
      createKelassDto.categoryId = categoryId;
      const course = await this.kelassService.create(createKelassDto);
      if (req.user!.role === 'super_admin') {
        await this.kelassService.createMentoring(
          createKelassDto.mentoringsId,
          course.id,
        );
      }
      if (req.user!.role === 'admin') {
        await this.kelassService.createMentoring(req.user!.id, course.id);
      }
      req.flash('success', 'program successfully created');
      res.redirect(`/category/${categoryId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'program failed created');
      res.redirect(`/category/${categoryId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Post('addStudent/:courseId')
  async addUserToCourse(
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
    @Body('userId') userId: number,
  ) {
    try {
      await this.kelassService.addUserToCourse(userId, courseId);
      req.flash('success', 'user successfuly add to program');
      res.redirect(`/program/addUser/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'user failed add to program');
      res.redirect(`/program/addUser/${courseId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    if (req.user!.role === 'super_admin') {
      // const course = await this.kelassService.findAllCourses();
      res.render('admin/course/index', { user: req.user });
    } else if (req.user!.role === 'admin') {
      // const course = await this.kelassService.findCourseByMentoring(req.user!.id);
      res.render('admin/course/index', { user: req.user });
    }
  }

  @Roles('admin', 'super_admin')
  @Get('filter')
  async filterKelas(
    @Res() res: Response,
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('alphabet') alphabet?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = parseInt(page || '1', 10);
    const itemsPerPage = parseInt(limit || '5', 10);

    const result = await this.kelassService.findPaginatedCourses({
      search: search || undefined,
      alphabet: alphabet || undefined,
      page: currentPage,
      limit: itemsPerPage,
      userId: req.user!.role === 'admin' ? req.user!.id : undefined,
    });

    return res.json({
      data: result.data,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / itemsPerPage),
      currentPage,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/create')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const category = await this.kelassService.findKategori();
    const courseType = await this.kelassService.findCourseTypes();
    const technologies = await this.kelassService.findTechnologies();
    const mentorings = await this.kelassService.findMentoring();
    return res.render('admin/course/create', {
      user: req.user,
      category,
      courseType,
      technologies,
      mentorings,
    });
  }

  @Roles('super_admin')
  @Get('/formCreate/:categoryId')
  async formCreateKelas(
    @Res() res: Response,
    @Req() req: Request,
    @Param('categoryId') categoryId: number,
  ) {
    const category = await this.kelassService.findOneKategori(categoryId);
    const courseType = await this.kelassService.findCourseTypes();
    const technologies = await this.kelassService.findTechnologies();
    const mentorings = await this.kelassService.findMentoring();
    return res.render('admin/course/formCreate', {
      user: req.user,
      courseType,
      technologies,
      mentorings,
      category,
      categoryId,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/addUser/:courseId')
  async formAddUser(
    @Res() res: Response,
    @Req() req: Request,
    @Param('courseId') courseId: number,
  ) {
    const users = await this.kelassService.findUser();
    const murid = await this.kelassService.findMurid(courseId);
    const course = await this.kelassService.findOne(courseId);
    return res.render('admin/course/addUser', {
      user: req.user,
      course,
      users,
      murid,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/edit/:courseId')
  async formEdit(
    @Res() res: Response,
    @Param('courseId') courseId: number,
    @Req() req: Request,
  ) {
    const course = await this.kelassService.findOne(courseId);
    const category = await this.kelassService.findKategori();
    const courseType = await this.kelassService.findCourseTypes();
    const technologies = await this.kelassService.findTechnologies();
    const mentorings = await this.kelassService.findMentoring();

    return res.render('admin/course/edit', {
      user: req.user,
      course,
      category,
      courseType,
      technologies,
      mentorings,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/logbookMentor/:courseId')
  async getMentorLogbook(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const logbookMentor = await this.kelassService.findMentorLogbook(courseId);
    res.json(logbookMentor);
  }

  @Roles('admin', 'super_admin')
  @Get('/logbookUser/:courseId')
  async getLogbookUser(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const logbookUser = await this.kelassService.findLogBookUser(courseId);
    res.json(logbookUser);
  }

  @Roles('admin', 'super_admin')
  @Get('/mentorProgram/:courseId')
  async getMentorKelas(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const mentor = await this.kelassService.findCourseMentors(courseId);
    res.json(mentor);
  }

  @Roles('admin', 'super_admin')
  @Get('/week/:courseId')
  async getMinggu(@Param('courseId') courseId: number, @Res() res: Response) {
    const weeks = await this.kelassService.findCourseWeeks(courseId);
    res.json(weeks);
  }

  @Roles('super_admin', 'admin')
  @Get('/userProgram/:courseId')
  async getUserKelas(@Param('courseId') courseId: number, @Res() res: Response) {
    const userCourses = await this.kelassService.findCourseUsers(courseId);
    res.json(userCourses);
  }

  @Roles('admin', 'super_admin')
  @Get('/installment/:courseId')
  async getCicilan(@Param('courseId') courseId: number, @Res() res: Response) {
    const availableMonths = await this.kelassService.findNo(courseId);
    const installments = await this.kelassService.findCourseInstallments(courseId);
    res.json({ availableMonths, installments });
  }

  @Roles('admin', 'super_admin')
  @Get('/register/:courseId')
  async getPendaftaran(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const pendaftaran = await this.kelassService.findCourseRegistrations(courseId);
    res.json(pendaftaran);
  }

  @Roles('admin', 'super_admin')
  @Get('/paymentInstallment/:courseId')
  async getPaymentInstallment(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const paymentInstallment =
      await this.kelassService.findCoursePaymentInstallments(courseId);
    res.json(paymentInstallment);
  }

  @Roles('admin', 'super_admin')
  @Get('/benefit/:courseId')
  async getProgramBenefit(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const course_benefits = await this.kelassService.findProgramBenefit(courseId);
    res.json(course_benefits);
  }

  @Roles('admin', 'super_admin')
  @Get('/faq/:courseId')
  async getPertanyaanKelas(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const courseQuestions =
      await this.kelassService.findCourseQuestions(courseId);
    res.json(courseQuestions);
  }

  @Roles('admin', 'super_admin')
  @Get('/flow/:courseId')
  async getAlurKelas(@Param('courseId') courseId: number, @Res() res: Response) {
    const course_flows = await this.kelassService.findCourseFlows(courseId);
    res.json(course_flows);
  }

  @Roles('admin', 'super_admin')
  @Get('/payment/:courseId')
  async getPembayaran(@Param('courseId') courseId: number, @Res() res: Response) {
    const pembayaran = await this.kelassService.findCoursePayments(courseId);
    res.json(pembayaran);
  }

  @Roles('admin', 'super_admin')
  @Get('/alumni/:courseId')
  async getAlumni(@Param('courseId') courseId: number, @Res() res: Response) {
    const alumni = await this.kelassService.findCourseAlumni(courseId);
    res.json(alumni);
  }

  @Roles('admin', 'super_admin')
  @Get('/detail/program/admin/:courseId')
  async detailKelas(
    @Param('courseId', ParseIntPipe) courseId: number,

    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (req.user!.role === 'admin') {
      const course = await this.kelassService.findOneAdminCourse(courseId);
      const mingguTerakhir =
        await this.kelassService.findLastWeek(courseId);
      res.render('admin/course/detail', {
        user: req.user,
        course,
        mingguTerakhir,
      });
    } else if (req.user!.role === 'super_admin') {
      const course = await this.kelassService.findOne(courseId);
      res.render('admin/course/detail', {
        user: req.user,
        course,
      });
    }
  }

  @Roles('user')
  @Get('myProgram/:id')
  async myCourse(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // const course = await this.kelassService.findMyCourse(id);
    const category = await this.kelassService.findKategoriMyProgram(id);
    const courseType = await this.kelassService.findMyProgramCourseTypes(id);
    res.render('user/mycourse', {
      // course,
      user: req.user,
      category,
      courseType,
    });
  }

  @Roles('user')
  @Get('program/detail/:courseId')
  async viewDetail(
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course = await this.kelassService.findOneCourse(courseId);
    const check_user = await this.kelassService.checkUserInCourse(
      course.id,
      req.user!.id,
    );
    const kelass = await this.kelassService.allClassExcept(course.id);
    // const courseQuestions = await this.kelassService.findCourseQuestions(courseId);
    // const course_flows = await this.kelassService.findCourseFlows(courseId);
    // const mentor = await this.kelassService.findCourseMentors(courseId);
    // const course_benefits = await this.kelassService.findProgramBenefit(courseId);
    const technologies = await this.kelassService.findCourseTechnologies(courseId);
    const installments = await this.kelassService.findCourseInstallments(courseId);

    if (course.check_paid === false) {
      // 1. DI SINI JALURNYA SUDAH DIUBAH KE FOLDER BARU
      res.render('detail_program/free_program/index', {
        course,
        user: req.user,
        kelass,
        check_user,
        // courseQuestions,
        // course_flows,
        // mentor,
        // course_benefits,
        technologies,
        installments,
      });
    } else {
      res.render('course/Bdetail', {
        course,
        user: req.user,
        kelass,
        check_user,
        // courseQuestions,
        // course_flows,
        // mentor,
        // course_benefits,
        technologies,
        installments,
      });
    }
  }

  @Get(':id')
  async detail(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let isUserInKelas = false;
    if (!req.user) {
      const course = await this.kelassService.findOneUserCourse(id);
      // const courseQuestions = await this.kelassService.findCourseQuestions(id);
      // const course_flows = await this.kelassService.findCourseFlows(id);
      // const mentor = await this.kelassService.findCourseMentors(id);
      // const course_benefits = await this.kelassService.findProgramBenefit(id);
      const technologies = await this.kelassService.findCourseTechnologies(id);
      const installments = await this.kelassService.findCourseInstallments(id);
      const userCourses = await this.kelassService.findCourseUsers(id);
      const kelass = await this.kelassService.allClassExcept(course.id);
      const daftar = await this.kelassService.sumStudent(course.id);
      if (course.check_paid === false) {
        res.render('detail_program/free_program/index', {
          course,
          kelass,
          daftar,
          technologies,
          installments,
          userCourses,
        });
      } else {
        res.render('course/Bdetail', {
          course,
          kelass,
          daftar,
          // courseQuestions,
          // course_flows,
          // mentor,
          // course_benefits,
          technologies,
          installments,
          userCourses,
        });
      }
    } else {
      const course = await this.kelassService.findOneUserLaunchCourse(id);
      for (const u of course.userCourses) {
        if (u.user.id === req.user.id) {
          isUserInKelas = true;
          break;
        }
      }
      if (isUserInKelas) {
        const mingguUpdated = await this.kelassService.findWeeks(
          id,
          req.user.id,
        );
        const userCourses = await this.kelassService.getUserCourseRelation(
          req.user.id,
          course.id,
        );
        const portfolio = await this.kelassService.findOnePortfolio(
          req.user.id,
          course.id,
        );
        res.render('course/detail', {
          userCourses,
          portfolio,
          user: req.user,
          course,
          weeks: mingguUpdated,
        });
      } else {
        const course = await this.kelassService.findOneUserCourse(id);
        // const courseQuestions = await this.kelassService.findCourseQuestions(id);
        // const course_flows = await this.kelassService.findCourseFlows(id);
        // const mentor = await this.kelassService.findCourseMentors(id);
        // const course_benefits = await this.kelassService.findProgramBenefit(id);
        const technologies = await this.kelassService.findCourseTechnologies(id);
        const installments = await this.kelassService.findCourseInstallments(id);
        const userCourses = await this.kelassService.findCourseUsers(id);
        const kelass = await this.kelassService.allClassExcept(course.id);
        const daftar = await this.kelassService.sumStudent(course.id);
        if (course.check_paid === false) {
          res.render('detail_program/free_program/index', {
            user: req.user,
            course,
            kelass,
            daftar,
            technologies,
            userCourses,
            installments,
          });
        } else {
          res.render('course/Bdetail', {
            user: req.user,
            course,
            kelass,
            daftar,
            // courseQuestions,
            // course_flows,
            // mentor,
            // course_benefits,
            technologies,
            userCourses,
            installments,
          });
        }
      }
    }
  }

  @Get('api/detail/:id/benefit')
  async getBenefit(@Param('id') id: number, @Res() res: Response) {
    const course_benefits = await this.kelassService.findProgramBenefit(id);
    return res.json({ course_benefits });
  }

  @Get('api/detail/:id/faq')
  async getFaq(@Param('id') id: number, @Res() res: Response) {
    const courseQuestions = await this.kelassService.findCourseQuestions(id);
    return res.json({ courseQuestions });
  }

  @Get('api/detail/:id/flow')
  async getFlow(@Param('id') id: number, @Res() res: Response) {
    const course_flows = await this.kelassService.findCourseFlows(id);
    return res.json({ course_flows });
  }

  @Get('api/detail/:id/mentor')
  async getMentor(@Param('id') id: number, @Res() res: Response) {
    const mentor = await this.kelassService.findCourseMentors(id);
    return res.json({ mentor });
  }

  @Roles('admin', 'super_admin')
  @Patch(':courseId')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'program',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('courseId') courseId: number,
    @Body() updateKelassDto: UpdateCoursesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const course = await this.kelassService.findOne(courseId);
      if (gambar) {
        await this.kelassService.deleteFile(course.image);
        updateKelassDto.image = req.body.uploadedImageUrls?.[0];
      }

      if (updateKelassDto.mentoringsId) {
        const currentMentoringUserId = course.mentorings?.[0]?.user?.id;
        const newMentoringUserId = Number(updateKelassDto.mentoringsId);

        if (currentMentoringUserId !== newMentoringUserId) {
          await this.kelassService.updateMentoring(
            newMentoringUserId,
            course.id,
          );
        }
      }

      if (updateKelassDto.paid_check === 'true') {
        updateKelassDto.check_paid = true;
      } else if (updateKelassDto.paid_check === 'false') {
        updateKelassDto.check_paid = false;
      }

      if (req.user?.role === 'super_admin') {
        updateKelassDto.process = 'acc';
      }

      if (req.body.technologiesIds_sent !== undefined && updateKelassDto.technologiesIds === undefined) {
        updateKelassDto.technologiesIds = [];
      }

      await this.kelassService.update(courseId, updateKelassDto);
      req.flash('success', 'Successfully update program');

      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'failed update program');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Patch(':courseId/toggle-launch')
  async updateLaunch(
    @Param('courseId') courseId: number,
    @Body() updateKelassDto: UpdateCoursesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.kelassService.updateLaunch(courseId, updateKelassDto);
      req.flash('success', 'program successfuly switch launch');
      res.redirect('/program');
    } catch (error: any) {
      req.flash('error', error.message || 'program failed to launch');
      res.redirect('/program');
    }
  }

  @Roles('admin', 'super_admin')
  @Patch(':courseId/toggle-status')
  async updateStatus(
    @Param('courseId') courseId: number,
    @Body() updateKelassDto: UpdateCoursesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.kelassService.updateLaunch(courseId, updateKelassDto);
      req.flash('success', 'program successfuly switch status');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'program failed to switch status');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Delete(':courseId')
  async remove(
    @Param('courseId') courseId: number,
    @Body('previous') previous: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const course = await this.kelassService.findOne(courseId);
      if (!course) {
        req.flash('error', 'Program not found');
        return res.redirect(previous || '/program');
      }
      await this.kelassService.deleteFile(course.image);
      await this.kelassService.remove(courseId);
      req.flash('success', 'Program successfully removed');
      return res.redirect(previous || '/program');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to remove program');
      return res.redirect(previous || '/program');
    }
  }

  @Roles('admin', 'super_admin')
  @Delete(':userId/program/:courseId')
  async removeCourseUser(
    @Param('userId') userId: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.kelassService.removeCourseUser(userId, courseId);
      req.flash('success', 'User successfully removed from program');
      res.redirect(`/program/addUser/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to remove user from program');
      res.redirect(`/program/addUser/${courseId}`);
    }
  }

  @Roles('user')
  @Get('session/:weeksId')
  async getPertemuan(
    @Res() res: Response,
    @Req() req: Request,
    @Param('weeksId') weeksId: number,
  ) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const session = await this.kelassService.findPertemuan(weeksId, user.id);
    res.json(session);
  }

  @Roles('user')
  @Get('quiz/:weeksId')
  async getQuiz(
    @Res() res: Response,
    @Param('weeksId') weeksId: number,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const quiz = await this.kelassService.findQuiz(weeksId, user.id);
    res.json(quiz);
  }
}
