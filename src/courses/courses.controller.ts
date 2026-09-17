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
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { UsersService } from 'src/users/users.service';
import { CreateCoursesDto } from './dto/create-courses.dto';
import { UpdateCoursesDto } from './dto/update-courses.dto';
import {
  mapCreateProgram,
  mapUpdateProgram,
} from './mappers/create-course.mapper';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { flashToast } from 'src/common/utils/toast.util';
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
  constructor(
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
  ) {}

  private readonly createValidationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
  });

  private async buildCreateDto(body: any, user: any) {
    const dto = mapCreateProgram(body, user);
    // Validasi kontrak domain (field asing dibuang via whitelist).
    await this.createValidationPipe.transform(dto, {
      type: 'body',
      metatype: CreateCoursesDto,
      data: '',
    });
    return dto;
  }

  @Roles('admin', 'super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
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
  async create(@Body() body: any, @Res() res: Response, @Req() req: Request) {
    try {
      const dto = await this.buildCreateDto(body, req.user);
      const course = await this.coursesService.create(dto);
      if (req.user!.role === 'super_admin' && dto.mentoringsId) {
        await this.coursesService.createMentoring(dto.mentoringsId, course.id);
      }
      if (req.user!.role === 'admin') {
        await this.coursesService.createMentoring(req.user!.id, course.id);
      }
      flashToast(
        req,
        'Program Created',
        'The new program has been added successfully.',
      );
      res.redirect('/program');
    } catch (error: any) {
      req.flash('error', error.message || 'program failed created');
      res.redirect('/program');
    }
  }

  @Roles('admin', 'super_admin')
  @Post(':categoryId')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
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
    @Body() body: any,
    @Res() res: Response,
    @Req() req: Request,
    @Param('categoryId') categoryId: string,
  ) {
    try {
      const dto = await this.buildCreateDto(body, req.user);
      dto.categoryId = categoryId;
      const course = await this.coursesService.create(dto);
      if (req.user!.role === 'super_admin' && dto.mentoringsId) {
        await this.coursesService.createMentoring(dto.mentoringsId, course.id);
      }
      if (req.user!.role === 'admin') {
        await this.coursesService.createMentoring(req.user!.id, course.id);
      }
      flashToast(
        req,
        'Program Created',
        'The new program has been added to this category.',
      );
      res.redirect(`/category/${categoryId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'program failed created');
      res.redirect(`/category/${categoryId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Post('addStudent/:courseId')
  async addUserToCourse(
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
    @Body('userId') userId: string,
  ) {
    try {
await this.coursesService.addUserToCourse(userId, courseId);
      flashToast(req, 'User Added', 'User successfully added to program');
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
      // const course = await this.coursesService.findAllCourses();
      res.render('admin/course/index', { user: req.user });
    } else if (req.user!.role === 'admin') {
      // const course = await this.coursesService.findCourseByMentoring(req.user!.id);
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

    const result = await this.coursesService.findPaginatedCourses({
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
    const category = await this.coursesService.findCategory();
    const courseType = await this.coursesService.findCourseTypes();
    const technologies = await this.coursesService.findTechnologies();
    const mentorings = await this.coursesService.findMentoring();
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
    @Param('categoryId') categoryId: string,
  ) {
    const category = await this.coursesService.findCategory();
    const courseType = await this.coursesService.findCourseTypes();
    const technologies = await this.coursesService.findTechnologies();
    const mentorings = await this.coursesService.findMentoring();
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
    @Param('courseId') courseId: string,
  ) {
    const users = await this.coursesService.findUser();
    const student = await this.coursesService.findStudent(courseId);
    const course = await this.coursesService.findOne(courseId);
    return res.render('admin/course/addUser', {
      user: req.user,
      course,
      users,
      student,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/edit/:courseId{/:categoryId}')
  async formEdit(
    @Res() res: Response,
    @Param('courseId') courseId: string,
    @Param('categoryId') categoryId: string,
    @Req() req: Request,
  ) {
    const course = await this.coursesService.findOne(courseId);
    const category = await this.coursesService.findCategory();
    const courseType = await this.coursesService.findCourseTypes();
    const technologies = await this.coursesService.findTechnologies();
    const mentorings = await this.coursesService.findMentoring();

    return res.render('admin/course/edit', {
      user: req.user,
      course,
      category,
      courseType,
      technologies,
      mentorings,
      categoryId,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/logbookMentor/:courseId')
  async getMentorLogbook(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const logbookMentor = await this.coursesService.findMentorLogbook(courseId);
    res.json(logbookMentor);
  }

  @Roles('admin', 'super_admin')
  @Get('/logbookUser/:courseId')
  async getLogbookUser(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const logbookUser = await this.coursesService.findLogBookUser(courseId);
    res.json(logbookUser);
  }

  @Roles('admin', 'super_admin')
  @Get('/mentorProgram/:courseId')
  async getMentorKelas(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const mentor = await this.coursesService.findCourseMentors(courseId);
    res.json(mentor);
  }

  @Roles('admin', 'super_admin')
  @Get('/week/:courseId')
  async getMinggu(@Param('courseId') courseId: string, @Res() res: Response) {
    const weeks = await this.coursesService.findCourseWeeks(courseId);
    res.json(weeks);
  }

  @Roles('super_admin', 'admin')
  @Get('/userProgram/:courseId')
  async getUserKelas(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const userCourses = await this.coursesService.findCourseUsers(courseId);
    res.json(userCourses);
  }

  @Roles('admin', 'super_admin')
  @Get('/installment/:courseId')
  async getCicilan(@Param('courseId') courseId: string, @Res() res: Response) {
    const availableMonths = await this.coursesService.findNo(courseId);
    const installments =
      await this.coursesService.findCourseInstallments(courseId);
    res.json({ availableMonths, installments });
  }

  @Roles('admin', 'super_admin')
  @Get('/register/:courseId')
  async getRegistration(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const registration =
      await this.coursesService.findCourseRegistrations(courseId);
    res.json(registration);
  }

  @Roles('admin', 'super_admin')
  @Get('/paymentInstallment/:courseId')
  async getPaymentInstallment(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const paymentInstallment =
      await this.coursesService.findCoursePaymentInstallments(courseId);
    res.json(paymentInstallment);
  }

  @Roles('admin', 'super_admin')
  @Get('/benefit/:courseId')
  async getProgramBenefit(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const course_benefits =
      await this.coursesService.findProgramBenefit(courseId);
    res.json(course_benefits);
  }

  @Roles('admin', 'super_admin')
  @Get('/participants/:courseId')
  async getProgramParticipants(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const participants =
      await this.coursesService.findCourseParticipants(courseId);
    res.json(participants);
  }

  @Roles('admin', 'super_admin')
  @Get('/faq/:courseId')
  async getCourseQuestions(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const courseQuestions =
      await this.coursesService.findCourseQuestions(courseId);
    res.json(courseQuestions);
  }

  @Roles('admin', 'super_admin')
  @Get('/flow/:courseId')
  async getCourseFlow(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const course_flows = await this.coursesService.findCourseFlows(courseId);
    res.json(course_flows);
  }

  @Roles('admin', 'super_admin')
  @Get('/payment/:courseId')
  async getPembayaran(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const payment = await this.coursesService.findCoursePayments(courseId);
    res.json(payment);
  }

  @Roles('admin', 'super_admin')
  @Get('/alumni/:courseId')
  async getAlumni(@Param('courseId') courseId: string, @Res() res: Response) {
    const alumni = await this.coursesService.findCourseAlumni(courseId);
    res.json(alumni);
  }

  @Roles('admin', 'super_admin')
  @Get('/detail/program/admin/:courseId')
  async detailKelas(
    @Param('courseId') courseId: string,
    @Query('categoryId') categoryId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (req.user!.role === 'admin') {
      const course = await this.coursesService.findOneAdminCourse(courseId);
      const lastWeek = await this.coursesService.findLastWeek(courseId);
      res.render('admin/course/detail', {
        user: req.user,
        course,
        lastWeek,
        categoryId,
      });
    } else if (req.user!.role === 'super_admin') {
      const course = await this.coursesService.findOne(courseId);
      res.render('super_admin/course/detail', {
        user: req.user,
        course,
        categoryId,
      });
    }
  }

  @Roles('user')
  @Get('myProgram/:id')
  async myCourse(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
    @Query('courseId') courseId?: string,
  ) {
    const course = await this.coursesService.findMyCourse(id);
    const category = await this.coursesService.findCategoryMyProgram(id);
    const courseType = await this.coursesService.findMyProgramCourseTypes(id);
    const userWithCourses = { userCourses: course.map((c) => ({ course: c })) };

    const selectedCourseId = courseId ? String(courseId) : course[0]?.id;
    const activeCourse =
      course.find((c) => c.id === selectedCourseId) ?? course[0];
    const logbooks = await this.usersService.findAllLogbooks(id);

    // const userWithCourses = await this.coursesService.findCompletedCoursesByUser(req.user!.id);
    const portfolio = await this.coursesService.findPortfolio(req.user!.id);

    // Rute ini merender shell yang sama dengan GET /users/profile, termasuk tab
    // Dashboard-nya. Tanpa data ini, menekan Dashboard di sidebar dari halaman
    // myProgram menampilkan angka nol di semua kartu statistik.
    const { dashboardStats, ongoingCourses } =
      await this.usersService.getDashboardData(req.user!.id);

    res.render('user/user_profile/index', {
      course,
      activeCourse,
      user: req.user,
      category,
      courseType,
      userWithCourses,
      logbooks,
      activeSection: courseId ? 'uiux' : 'learning',
      portfolio,
      dashboardStats,
      ongoingCourses,
      bareShell: true,
    });
  }

  @Roles('user')
  @Get('myProgram/:id/fragment')
  async myCourseFragment(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('courseId') courseId?: string,
  ) {
    const course = await this.coursesService.findMyCourse(id);
    const selectedCourseId = courseId ? String(courseId) : course[0]?.id;
    const activeCourse =
      course.find((c) => c.id === selectedCourseId) ?? course[0];

    return res.render(
      'partials/user/sidebar_user_profile/my_learning/start_learning/index',
      {
        course: activeCourse,
        layout: false,
      },
    );
  }

  @Roles('user')
  @Get('myProgram/:id/fragment/assignment')
  async myCourseAssignmentFragment(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('courseId') courseId?: string,
  ) {
    const course = await this.coursesService.findMyCourse(id);
    const selectedCourseId = courseId ? String(courseId) : course[0]?.id;
    const activeCourse =
      course.find((c) => c.id === selectedCourseId) ?? course[0];

    return res.render('partials/user/sidebar_user_profile/assignment/index', {
      course: activeCourse,
      layout: false,
    });
  }

  @Roles('user')
  @Get('myProgram/:id/fragment/presentation')
  async myCoursePresentationFragment(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
    @Query('courseId') courseId?: string,
  ) {
    const course = await this.coursesService.findMyCourse(id);
    const selectedCourseId = courseId ? String(courseId) : course[0]?.id;
    const activeCourse =
      course.find((c) => c.id === selectedCourseId) ?? course[0];

    return res.render(
      'partials/user/sidebar_user_profile/my_learning/start_learning/attendance/index',
      {
        course: activeCourse,
        user: req.user,
        layout: false,
      },
    );
  }

  @Roles('user')
  @Get('myProgram/:id/fragment/quiz')
  async myCourseQuizFragment(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('courseId') courseId?: string,
  ) {
    const course = await this.coursesService.findMyCourse(id);
    const selectedCourseId = courseId ? String(courseId) : course[0]?.id;
    const activeCourse =
      course.find((c) => c.id === selectedCourseId) ?? course[0];

    return res.render(
      'partials/user/sidebar_user_profile/my_learning/start_learning/quiz/index',
      {
        course: activeCourse,
        layout: false,
      },
    );
  }

  @Roles('user')
  @Get('program/detail/:courseId')
  async viewDetail(
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course = await this.coursesService.findOneCourse(courseId);
    const check_user = await this.coursesService.checkUserInCourse(
      course.id,
      req.user!.id,
    );
    const kelass = await this.coursesService.allClassExcept(course.id);
    const courseQuestions =
      await this.coursesService.findCourseQuestions(courseId);
    const faqs = courseQuestions.map((cq) => ({
      question: cq.questions,
      answer: cq.answers,
    }));
    // const course_flows = await this.coursesService.findCourseFlows(courseId);
    // const mentor = await this.coursesService.findCourseMentors(courseId);
    // const course_benefits = await this.coursesService.findProgramBenefit(courseId);
    const technologies =
      await this.coursesService.findCourseTechnologies(courseId);
    const installments =
      await this.coursesService.findCourseInstallments(courseId);
    const studentList = await this.coursesService.sumStudent(course.id);

    const statusOptions = [
      'University Student',
      'Fresh Graduate',
      'Job Seeker',
      'Employee',
      'Freelancer',
      'Entrepreneur',
      'Other',
    ];
    const referalOptions = [
      'Instagram',
      'TikTok',
      'LinkedIn',
      'Friends',
      'University',
      'WhatsApp Group',
      'Webinar/Event',
      'Website',
      'Other',
    ];

    if (course.checkPaid === false) {
      // 1. DI SINI JALURNYA SUDAH DIUBAH KE FOLDER BARU
      res.render('detail_program/free_program/index', {
        course,
        user: req.user,
        kelass,
        check_user,
        studentList,
        faqs,
        // course_flows,
        // mentor,
        // course_benefits,
        technologies,
        installments,
        currentStatusOptions: statusOptions,
        referalSourceOptions: referalOptions,
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
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let isUserInKelas = false;
    if (!req.user) {
      const course = await this.coursesService.findOneUserCourse(id);
      const courseQuestions = await this.coursesService.findCourseQuestions(id);
      const faqs = courseQuestions.map((cq) => ({
        question: cq.questions,
        answer: cq.answers,
      }));
      const course_benefits = await this.coursesService.findProgramBenefit(id);
      const technologies = await this.coursesService.findCourseTechnologies(id);
      const installments = await this.coursesService.findCourseInstallments(id);
      const userCourses = await this.coursesService.findCourseUsers(id);
      const kelass = await this.coursesService.allClassExcept(course.id);
      const studentList = await this.coursesService.sumStudent(course.id);
      const statusOptions = [
        'University Student',
        'Fresh Graduate',
        'Job Seeker',
        'Employee',
        'Freelancer',
        'Entrepreneur',
        'Other',
      ];
      const referalOptions = [
        'Instagram',
        'TikTok',
        'LinkedIn',
        'Friends',
        'University',
        'WhatsApp Group',
        'Webinar/Event',
        'Website',
        'Other',
      ];

      if (course.checkPaid === false) {
        res.render('detail_program/free_program/index', {
          course,
          kelass,
          studentList,
          technologies,
          installments,
          userCourses,
          faqs,
          currentStatusOptions: statusOptions,
          referalSourceOptions: referalOptions,
        });
      } else {
        res.render('detail_program/paid_program/index', {
          course,
          kelass,
          studentList,
          courseQuestions,
          // course_flows,
          // mentor,
          course_benefits,
          technologies,
          installments,
          userCourses,
          faqs,
        });
      }
    } else {
      const course = await this.coursesService.findOneUserLaunchCourse(id);
      for (const u of course.userCourses) {
        if (u.user.id === req.user.id) {
          isUserInKelas = true;
          break;
        }
      }
      if (isUserInKelas) {
        // res.redirect(`/program/myProgram/${req.user.id}?courseId=${course.id}`);
          const mingguUpdated = await this.coursesService.findWeeks(
          id,
          req.user.id,
        );
        const user_kelas = await this.coursesService.findOneUserCourse(
          // req.user.id,
          course.id,
        );
        const portfolio = await this.coursesService.findOnePortfolio(
          req.user.id,
          course.id,
        );
        res.render('kelas/detail', {
          user_kelas,
          portfolio,
          user: req.user,
          course,
          minggu: mingguUpdated,
        });
      } else {
        const course = await this.coursesService.findOneUserCourse(id);
        const courseQuestions =
          await this.coursesService.findCourseQuestions(id);
        const faqs = courseQuestions.map((cq) => ({
          question: cq.questions,
          answer: cq.answers,
        }));
        // const course_flows = await this.coursesService.findCourseFlows(id);
        // const mentor = await this.coursesService.findCourseMentors(id);
        // const course_benefits = await this.coursesService.findProgramBenefit(id);
        const technologies =
          await this.coursesService.findCourseTechnologies(id);
        const installments =
          await this.coursesService.findCourseInstallments(id);
        const userCourses = await this.coursesService.findCourseUsers(id);
        const kelass = await this.coursesService.allClassExcept(course.id);
        const studentList = await this.coursesService.sumStudent(course.id);
        const statusOptions = [
          'University Student',
          'Fresh Graduate',
          'Job Seeker',
          'Employee',
          'Freelancer',
          'Entrepreneur',
          'Other',
        ];
        const referalOptions = [
          'Instagram',
          'TikTok',
          'LinkedIn',
          'Friends',
          'University',
          'WhatsApp Group',
          'Webinar/Event',
          'Website',
          'Other',
        ];

        if (course.checkPaid === false) {
          res.render('detail_program/free_program/index', {
            user: req.user,
            course,
            kelass,
            studentList,
            technologies,
            userCourses,
            installments,
            faqs,
            currentStatusOptions: statusOptions,
            referalSourceOptions: referalOptions,
          });
        } else {
          res.render('detail_program/paid_program/index', {
            user: req.user,
            course,
            kelass,
            studentList,
            courseQuestions,
            faqs,
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
  async getBenefit(@Param('id') id: string, @Res() res: Response) {
    const course_benefits = await this.coursesService.findProgramBenefit(id);
    return res.json({ course_benefits });
  }

  @Get('api/detail/:id/faq')
  async getFaq(@Param('id') id: string, @Res() res: Response) {
    const courseQuestions = await this.coursesService.findCourseQuestions(id);
    return res.json({ courseQuestions });
  }

  @Get('api/detail/:id/flow')
  async getFlow(@Param('id') id: string, @Res() res: Response) {
    const course_flows = await this.coursesService.findCourseFlows(id);
    return res.json({ course_flows });
  }

  @Get('api/detail/:id/mentor')
  async getMentor(@Param('id') id: string, @Res() res: Response) {
    const mentor = await this.coursesService.findCourseMentors(id);
    return res.json({ mentor });
  }

  @Roles('admin', 'super_admin')
  @Patch(':courseId')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
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
    @Param('courseId') courseId: string,
    @Body() body: any,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const course = await this.coursesService.findOne(courseId);
      const dto = mapUpdateProgram(req.body ?? body, req.user);
      if (gambar) {
        await this.coursesService.deleteFile(course.image);
      }

      if (dto.mentoringsId) {
        const currentMentoringUserId = course.mentorings?.[0]?.user?.id;
        const newMentoringUserId = dto.mentoringsId;

        if (currentMentoringUserId !== newMentoringUserId) {
          await this.coursesService.updateMentoring(
            newMentoringUserId,
            course.id,
          );
        }
      }

      await this.coursesService.update(courseId, dto);
      flashToast(
        req,
        'Changes Saved',
        'The program information has been updated.',
      );

      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'failed update program');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Patch(':courseId/toggle-launch')
  async updateLaunch(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCoursesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.coursesService.updateLaunch(courseId, updateCourseDto);
      flashToast(
        req,
        'Program Updated',
        'The program launch status has been changed.',
      );
      res.redirect('/program');
    } catch (error: any) {
      req.flash('error', error.message || 'program failed to launch');
      res.redirect('/program');
    }
  }

  @Roles('admin', 'super_admin')
  @Patch(':courseId/toggle-launch-json')
  async updateLaunchJson(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.coursesService.toggleLaunch(courseId);
      return res.json({ success: true, launch: result.launch });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to toggle launch',
      });
    }
  }

  @Roles('admin', 'super_admin')
  @Patch(':courseId/toggle-status')
  async updateStatus(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCoursesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.coursesService.updateLaunch(courseId, updateCourseDto);
      flashToast(
        req,
        'Program Updated',
        'The program status has been changed.',
      );
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'program failed to switch status');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Delete(':courseId')
  async remove(
    @Param('courseId') courseId: string,
    @Body('previous') previous: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const course = await this.coursesService.findOne(courseId);
      if (!course) {
        req.flash('error', 'Program not found');
        return res.redirect(previous || '/program');
      }
      await this.coursesService.deleteFile(course.image);
      await this.coursesService.remove(courseId);
      flashToast(
        req,
        'Program Deleted',
        'The program has been permanently removed.',
      );
      return res.redirect(previous || '/program');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to remove program');
      return res.redirect(previous || '/program');
    }
  }

  @Roles('admin', 'super_admin')
  @Delete(':userId/program/:courseId')
  async removeCourseUser(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.coursesService.removeCourseUser(userId, courseId);
      flashToast(
        req,
        'User Removed',
        'The user has been permanently removed from the program.',
      );
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
    @Param('weeksId') weeksId: string,
  ) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const session = await this.coursesService.findSession(weeksId, user.id);
    res.json(session);
  }

  @Roles('user')
  @Get('quiz/:weeksId')
  async getQuiz(
    @Res() res: Response,
    @Param('weeksId') weeksId: string,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const quiz = await this.coursesService.findQuiz(weeksId, user.id);
    res.json(quiz);
  }
}
