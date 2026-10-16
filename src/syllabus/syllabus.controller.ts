import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Res,
  Req,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { SyllabusService } from './syllabus.service';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';
import { CreateQuizDto } from 'src/quiz/dto/create-quiz.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { CoursesService } from 'src/courses/courses.service';
import { QuizService } from 'src/quiz/quiz.service';
import { flashToast } from 'src/common/utils/toast.util';
import { Quiz } from 'src/entities/quiz.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { Course } from 'src/entities/course.entity';


const syllabusFileStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(process.cwd(), 'uploads', 'syllabus');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  },
});

const syllabusFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  cb: (err: Error | null, accept: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();
  if (file.fieldname === 'pdfFile') {
    if (ext === '.pdf') return cb(null, true);
    return cb(
      new Error(
        'Format file PDF tidak valid. Hanya berkas .pdf yang diperbolehkan.',
      ),
      false,
    );
  }
  if (file.fieldname === 'pptFile') {
    if (ext === '.ppt' || ext === '.pptx') return cb(null, true);
    return cb(
      new Error(
        'Format file Presentasi tidak valid. Hanya berkas .ppt atau .pptx yang diperbolehkan.',
      ),
      false,
    );
  }
  cb(null, true);
};

const syllabusMulterOptions = {
  storage: syllabusFileStorage,
  fileFilter: syllabusFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas 5 MB sesuai permintaan
};
@Controller('syllabus')
export class SyllabusController {
  constructor(
    private readonly syllabusService: SyllabusService,
    private readonly coursesService: CoursesService,
    private readonly quizService: QuizService,
  ) {}

  @Roles('admin', 'super_admin')
  @Post(':courseId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdfFile', maxCount: 1 },
        { name: 'pptFile', maxCount: 1 },
      ],
      syllabusMulterOptions,
    ),
  )
  async create(
    @Param('courseId') courseId: string,
    @Body() createSyllabusDto: CreateSyllabusDto,
    @Res() res: Response,
    @Req() req: Request,
    @UploadedFiles()
    files?: {
      pdfFile?: Express.Multer.File[];
      pptFile?: Express.Multer.File[];
    },
  ) {
    try {
      if (files?.pdfFile?.[0]) {
        createSyllabusDto.pdfFile =
          '/uploads/syllabus/' + files.pdfFile[0].filename;
        createSyllabusDto.pdfOriginalName = files.pdfFile[0].originalname;
        createSyllabusDto.pdfFileSize = files.pdfFile[0].size;
      }
      if (createSyllabusDto.pptUrl && createSyllabusDto.pptUrl.trim()) {
        createSyllabusDto.pptFile = createSyllabusDto.pptUrl.trim();
        createSyllabusDto.pptOriginalName = 'Slide-Google-Slides.pptx';
      }
      if (files?.pptFile?.[0]) {
        createSyllabusDto.pptFile =
          createSyllabusDto.pptUrl && createSyllabusDto.pptUrl.trim()
            ? createSyllabusDto.pptUrl.trim()
            : '/uploads/syllabus/' + files.pptFile[0].filename;
        createSyllabusDto.pptOriginalName = files.pptFile[0].originalname;
        createSyllabusDto.pptFileSize = files.pptFile[0].size;
      }
      await this.syllabusService.create(createSyllabusDto, courseId);
      flashToast(
        req,
        'Syllabus Created',
        'The new syllabus has been added to the program.',
      );
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Syllabus failed to create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Get('course/:courseId')
  async getByCourse(@Param('courseId') courseId: string, @Res() res: Response) {
    const syllabusList = await this.syllabusService.findByCourse(courseId);
    res.json(syllabusList);
  }

  @Roles('admin', 'super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let syllabus = await this.syllabusService.findOne(id).catch(() => null);
    if (!syllabus) {
      const syllabusList = await this.syllabusService
        .findByCourse(id)
        .catch(() => []);
      if (syllabusList && syllabusList.length > 0) {
        syllabus = syllabusList[0];
      }
    }
    if (!syllabus) {
      req.flash('error', 'Syllabus not found');
      return res.redirect('/program');
    }
    const isCompleted = await this.syllabusService.isSyllabusCompleted(
      syllabus.id,
    );
    if (isCompleted) {
      flashToast(
        req,
        'Cannot Edit Syllabus',
        'Syllabus cannot be edited because it has already been completed by a user.',
      );
      return res.redirect(
        syllabus.course?.id
          ? `/program/detail/program/admin/${syllabus.course.id}`
          : '/program',
      );
    }
    const maxSyllabus = await this.syllabusService.findCourseSyllabus(
      syllabus.course?.id,
    );
    return res.render('admin/course/edit_syllabus', {
      user: req.user,
      syllabus,
      course: syllabus.course,
      courseId: syllabus.course?.id,
      maxSyllabus,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/quiz/:syllabusId')
  async getQuiz(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Res() res: Response,
  ) {
    const quiz = await this.syllabusService.findQuiz(syllabusId);
    res.json(quiz);
  }

  @Roles('admin', 'super_admin')
  @Get('quiz/create/:id')
  async formCreateQuiz(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let syllabus = await this.syllabusService.findOne(id).catch(() => null);
    if (!syllabus) {
      const syllabusList = await this.syllabusService
        .findByCourse(id)
        .catch(() => []);
      if (syllabusList && syllabusList.length > 0) {
        syllabus = syllabusList[0];
      }
    }
    if (!syllabus) {
      req.flash('error', 'Syllabus not found');
      return res.redirect('/program');
    }
    return res.render('admin/course/create_quiz', {
      user: req.user,
      syllabus,
      syllabusId: syllabus.id,
      course: syllabus.course,
      courseId: syllabus.course?.id,
    });
  }

  @Roles('admin', 'super_admin')
  @Post('quiz/:syllabusId')
  async createQuiz(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Body() createQuizDto: CreateQuizDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.syllabusService.createQuiz(syllabusId, createQuizDto);
      flashToast(
        req,
        'Quiz Created',
        'The new quiz has been added to this syllabus.',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Failed to create quiz');
      res.redirect(`/syllabus/${syllabusId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Get('quiz/detail/:id')
  async detailQuiz(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let quiz: Quiz | null = null;
    let syllabus: Syllabus | null = null;
    let course: Course | null = null;

    // 1. Cek apakah id adalah id Quiz
    const foundQuiz = await this.quizService.findOne(id).catch(() => null);
    if (foundQuiz) {
      quiz = foundQuiz;
      syllabus = foundQuiz.syllabus || null;
      course = syllabus?.course || foundQuiz.weeks?.course || null;
    }

    // 2. Jika bukan quiz, cek apakah id adalah id Syllabus
    if (!quiz) {
      const foundSyllabus = await this.syllabusService
        .findOne(id)
        .catch(() => null);
      if (foundSyllabus) {
        syllabus = foundSyllabus;
        course = foundSyllabus.course || null;
        quiz = foundSyllabus.quiz?.[0] || null;
      }
    }

    // 3. Jika bukan syllabus, cek apakah id adalah id Course
    if (!quiz) {
      const syllabusList: Syllabus[] =
        (await this.syllabusService.findByCourse(id).catch(() => [])) || [];
      const syllabusWithQuiz = syllabusList.find(
        (s) => s?.quiz && s.quiz.length > 0,
      );
      if (syllabusWithQuiz) {
        syllabus = await this.syllabusService.findOne(syllabusWithQuiz.id);
        quiz = syllabus?.quiz?.[0] || null;
        course = (syllabus?.course as Course) || null;
      }
    }

    if (!quiz) {
      flashToast(
        req,
        'Quiz Not Found',
        'Belum ada quiz yang dibuat untuk syllabus ini.',
      );
      if (syllabus) {
        return res.redirect(`/syllabus/${syllabus.id}`);
      }
      return res.redirect('/program');
    }

    const questions = await this.quizService.findQuestions(quiz.id);
    const scores = await this.quizService.findScore(quiz.id);
    const isAttempted = (scores || []).length > 0;

    return res.render('admin/course/detail_quiz', {
      user: req.user,
      quiz,
      syllabus,
      course,
      courseId: course?.id,
      questions,
      scores,
      isAttempted,
    });
  }

  @Roles('admin', 'super_admin')
  @Delete('quiz/:quizId')
  async removeQuiz(
    @Param('quizId', new ParseUUIDPipe()) quizId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const quiz = await this.quizService.findOne(quizId);
      const syllabusId = quiz?.syllabus?.id;
      await this.quizService.remove(quizId);
      flashToast(req, 'Quiz Deleted', 'The quiz has been permanently removed.');
      const referer = req.headers.referer;
      if (referer && referer.includes('/program/detail/program/admin/')) {
        return res.redirect(referer);
      }
      if (syllabusId) {
        return res.redirect(`/syllabus/${syllabusId}`);
      }
      return res.redirect('/program');
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Failed to delete quiz');
      return res.redirect('back');
    }
  }

  @Roles('admin', 'super_admin')
  @Get(':syllabusId')
  async findOne(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const syllabus = await this.syllabusService.findOne(syllabusId);
    if (!syllabus) {
      req.flash('error', 'Syllabus not found');
      return res.redirect('/program');
    }
    const isCompleted =
      await this.syllabusService.isSyllabusCompleted(syllabusId);
    res.render('admin/course/detail_syllabus_item', {
      user: req.user,
      syllabus,
      course: syllabus.course,
      courseId: syllabus.course?.id,
      isCompleted,
    });
  }

  @Roles('user', 'admin', 'super_admin')
  @Get('learn/:syllabusId')
  async detailForUser(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const detail = await this.syllabusService.findDetailForUser(
      syllabusId,
      req.user!.id,
    );
    res.render('user/syllabus/detail', {
      user: req.user,
      syllabus: detail.syllabus,
      course: detail.course,
      quiz: detail.quiz,
      questionCount: detail.questionCount,
      minScore: detail.minScore,
      quizStatus: detail.quizStatus,
      next: detail.next,
      materials: detail.materials,
      pdfMaterials: detail.pdfMaterials,
      pptMaterials: detail.pptMaterials,
      firstPdf: detail.firstPdf,
      firstPpt: detail.firstPpt,
      hasVideo: detail.hasVideo,
      videoEmbedUrl: detail.videoEmbedUrl,
      videoDuration: detail.videoDuration,
      isYoutube: detail.isYoutube,
      hasPdf: detail.hasPdf,
      hasPpt: detail.hasPpt,
      hasAnyMaterial: detail.hasAnyMaterial,
      bareShell: true,
    });
  }

  @Roles('user', 'admin', 'super_admin')
  @Get('learn/:syllabusId/view/ppt')
  async viewPpt(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Query('materialId') materialId: string | undefined,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const detail = await this.syllabusService.findDetailForUser(
      syllabusId,
      req.user!.id,
    );
    const pptList = detail.pptMaterials || [];
    const selected =
      (materialId && pptList.find((m) => m.id === materialId)) ||
      pptList[0] ||
      null;

    if (!selected) {
      req.flash('error', 'Slide presentasi belum tersedia.');
      return res.redirect(`/syllabus/learn/${syllabusId}`);
    }

    let embedUrl = selected.file || '';
    const isGoogleSlides = embedUrl.includes('docs.google.com/presentation');
    if (isGoogleSlides) {
      embedUrl = embedUrl.replace('/pub?', '/pubembed?');
    }
    const isLocalFile =
      !isGoogleSlides &&
      (embedUrl.startsWith('/uploads/') || embedUrl.startsWith('/'));

    return res.render('user/syllabus/ppt_viewer', {
      user: req.user,
      syllabus: detail.syllabus,
      course: detail.course,
      pptList,
      selected: {
        ...selected,
        embedUrl,
        isGoogleSlides,
        isLocalFile,
      },
      bareShell: true,
    });
  }

  @Roles('user', 'admin', 'super_admin')
  @Get('learn/:syllabusId/download/:type')
  async downloadMaterial(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Param('type') type: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const syllabus = await this.syllabusService.findOne(syllabusId);
    if (!syllabus) {
      req.flash('error', 'Syllabus not found');
      return res.redirect('/program');
    }

    const isPdf = type.toLowerCase() === 'pdf';
    const fileUrl = isPdf ? syllabus.pdfFile : syllabus.pptFile;
    const originalName =
      (isPdf ? syllabus.pdfOriginalName : syllabus.pptOriginalName) ||
      (isPdf ? 'modul.pdf' : 'slide.pptx');

    if (!fileUrl) {
      req.flash('error', `Berkas ${type.toUpperCase()} belum tersedia`);
      return res.redirect(`/syllabus/learn/${syllabusId}`);
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return res.redirect(fileUrl);
    }

    const rel = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const candidates = [
      join(process.cwd(), rel),
      join(process.cwd(), 'uploads', rel),
      join(process.cwd(), 'public', rel),
    ];

    for (const filePath of candidates) {
      if (existsSync(filePath)) {
        return res.download(filePath, originalName);
      }
    }

    req.flash('error', 'Berkas fisik tidak ditemukan di server.');
    return res.redirect(`/syllabus/learn/${syllabusId}`);
  }

  @Roles('user', 'admin', 'super_admin')
  @Get('learn/:syllabusId/materials/:materialId/download')
  async downloadMaterialById(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Param('materialId', new ParseUUIDPipe()) materialId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const detail = await this.syllabusService.findDetailForUser(
      syllabusId,
      req.user!.id,
    );
    const material = (detail.materials || []).find((m) => m.id === materialId);
    if (!material || !material.file) {
      return this.downloadMaterial(syllabusId, 'pdf', res, req);
    }

    const fileUrl = material.file;
    const originalName = material.originalFileName || 'materi-silabus';

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return res.redirect(fileUrl);
    }

    const rel = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const candidates = [
      join(process.cwd(), rel),
      join(process.cwd(), 'uploads', rel),
      join(process.cwd(), 'public', rel),
    ];

    for (const filePath of candidates) {
      if (existsSync(filePath)) {
        return res.download(filePath, originalName);
      }
    }

    req.flash('error', 'Berkas fisik tidak ditemukan di server.');
    return res.redirect(`/syllabus/learn/${syllabusId}`);
  }

  @Roles('admin', 'super_admin')
  @Patch('update/:syllabusId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdfFile', maxCount: 1 },
        { name: 'pptFile', maxCount: 1 },
      ],
      syllabusMulterOptions,
    ),
  )
  async update(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Body() updateSyllabusDto: UpdateSyllabusDto,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles()
    files?: {
      pdfFile?: Express.Multer.File[];
      pptFile?: Express.Multer.File[];
    },
  ) {
    try {
      const syllabus = await this.syllabusService.findOne(syllabusId);
      if (files?.pdfFile?.[0]) {
        updateSyllabusDto.pdfFile =
          '/uploads/syllabus/' + files.pdfFile[0].filename;
        updateSyllabusDto.pdfOriginalName = files.pdfFile[0].originalname;
        updateSyllabusDto.pdfFileSize = files.pdfFile[0].size;
      }
      if (updateSyllabusDto.pptUrl && updateSyllabusDto.pptUrl.trim()) {
        updateSyllabusDto.pptFile = updateSyllabusDto.pptUrl.trim();
        if (!updateSyllabusDto.pptOriginalName && !syllabus?.pptOriginalName) {
          updateSyllabusDto.pptOriginalName = 'Slide-Google-Slides.pptx';
        }
      }
      if (files?.pptFile?.[0]) {
        updateSyllabusDto.pptFile =
          updateSyllabusDto.pptUrl && updateSyllabusDto.pptUrl.trim()
            ? updateSyllabusDto.pptUrl.trim()
            : '/uploads/syllabus/' + files.pptFile[0].filename;
        updateSyllabusDto.pptOriginalName = files.pptFile[0].originalname;
        updateSyllabusDto.pptFileSize = files.pptFile[0].size;
      }

      await this.syllabusService.update(syllabusId, updateSyllabusDto);
      flashToast(
        req,
        'Changes Saved',
        'The syllabus information has been updated.',
      );
      res.redirect(
        `/program/detail/program/admin/${syllabus?.course?.id || ''}`,
      );
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Syllabus failed to update');
      res.redirect('/program');
    }
  }

  @Roles('admin', 'super_admin')
  @Post('update/:syllabusId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdfFile', maxCount: 1 },
        { name: 'pptFile', maxCount: 1 },
      ],
      syllabusMulterOptions,
    ),
  )
  async updatePost(
    @Param('syllabusId', new ParseUUIDPipe()) syllabusId: string,
    @Body() updateSyllabusDto: UpdateSyllabusDto,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles()
    files?: {
      pdfFile?: Express.Multer.File[];
      pptFile?: Express.Multer.File[];
    },
  ) {
    return this.update(syllabusId, updateSyllabusDto, req, res, files);
  }

  @Roles('admin', 'super_admin')
  @Delete(':id/:courseId')
  async remove(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.syllabusService.remove(id);
      flashToast(
        req,
        'Syllabus Deleted',
        'The syllabus has been permanently removed.',
      );
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Syllabus failed to delete');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
