import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { flashToast, flashToastError } from 'src/common/utils/toast.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateFileInterceptor } from 'src/common/interceptors/validate-file.interceptor';
import { ValidateFile } from 'src/common/decorators/validate-file.decorator';
import { SyllabusService } from './syllabus.service';
import { capabilitiesForCourse } from 'src/courses/program-type';

/**
 * Halaman silabus untuk student (program non-bootcamp).
 *
 * Bersanding dengan `GET /program/session/detail/:sessionId` milik bootcamp;
 * keduanya tidak saling menyentuh.
 *
 * `:syllabusId` divalidasi bentuknya lebih dulu - tanpa itu, path yang
 * kebetulan jatuh di bawah rute ini (mis. gambar dengan src relatif) masuk
 * sebagai id dan Postgres menjawabnya dengan 500, bukan 404. Pelajaran dari
 * /program/myProgram/logo.png.
 */
@UseGuards(AuthenticatedGuard)
@Controller('program/syllabus')
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  @Roles('user')
  @Get('detail/:syllabusId')
  async detail(
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const syllabus = await this.syllabusService.findOne(syllabusId);
    const userId = req.user!.id;
    const courseId = syllabus.course.id;

    // Keadaan dibaca dari daftar, bukan dihitung ulang di sini - supaya
    // aturan buka-kuncinya cuma hidup di satu tempat.
    const views = await this.syllabusService.findForStudent(courseId, userId);
    const view = views.find((v) => v.id === syllabusId) ?? null;

    // Silabus terkunci tidak boleh dibuka lewat URL langsung.
    if (!view || view.state === 'LOCKED') {
      flashToastError(
        req,
        'Syllabus is locked',
        'Complete the previous syllabus first.',
      );
      return res.redirect(
        `/program/myProgram/${userId}?courseId=${courseId}&tab=uiux`,
      );
    }

    // Jawaban student ditempelkan ke tiap tugas, bukan dikirim sebagai daftar
    // terpisah: template tidak punya cara mencari di dalam Map, dan mencocokkan
    // di Handlebars selalu berakhir jadi helper baru yang tidak perlu.
    const answers = await this.syllabusService.answersForStudent(
      syllabusId,
      userId,
    );
    const assignments = (syllabus.assignments ?? []).map((a) => ({
      ...a,
      answer: answers.get(a.id) ?? null,
    }));

    // Kuis silabus tidak punya gerbang tersendiri: silabus ini sudah terbuka
    // (kalau tidak, controller sudah mengalihkan di atas), berarti kuisnya
    // terbuka. Tidak ada QuizProgress yang perlu dibuka lebih dulu seperti di
    // jalur bootcamp.
    const quiz = await this.syllabusService.quizFor(syllabusId);

    return res.render('user/learning/syllabus', {
      user: req.user,
      syllabus,
      quiz,
      assignments,
      view,
      course: syllabus.course,
      caps: capabilitiesForCourse(syllabus.course),
      bareShell: true,
    });
  }

  /** Student mengumpulkan atau memperbarui jawaban satu tugas silabus. */
  @Roles('user')
  @Post('detail/:syllabusId/assignment/:assignmentId/submit')
  async submitAnswer(
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Param('assignmentId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    assignmentId: string,
    @Body('file') file: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.syllabusService.submitAnswer(
        assignmentId,
        req.user!.id,
        file,
      );
      flashToast(req, 'Answer submitted', 'Your mentor will review it.');
    } catch (e: any) {
      flashToastError(req, 'Could not submit', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/detail/${syllabusId}`);
  }

  // =====================================================================
  // ADMIN
  //
  // Program non-bootcamp sampai sekarang hanya bisa diisi lewat SQL. Rute di
  // bawah ini yang membuatnya bisa dikelola dari aplikasi.
  //
  // Urutan TIDAK diterima dari form: SyllabusService yang menghitungnya, dan
  // `UNIQUE (courseId, order)` yang menjaganya. Admin tidak perlu memikirkan
  // nomor sama sekali.
  // =====================================================================

  @Roles('admin', 'super_admin')
  @Get('manage/:courseId')
  async manage(
    @Param('courseId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const course = await this.syllabusService.courseFor(courseId);
    const silabus = await this.syllabusService.findByCourseWithCounts(courseId);
    return res.render('admin/syllabus/index', {
      user: req.user,
      course,
      silabus,
      bareShell: true,
    });
  }

  @Roles('admin', 'super_admin')
  @Post('manage/:courseId')
  async createSyllabus(
    @Param('courseId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    courseId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!title?.trim()) throw new Error('Title is required.');
      await this.syllabusService.create(courseId, {
        title: title.trim(),
        description: description?.trim() || null,
      });
      flashToast(req, 'Syllabus added', 'It is now the last one in the list.');
    } catch (e: any) {
      flashToastError(req, 'Could not add syllabus', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}`);
  }

  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/update')
  async updateSyllabus(
    @Param('courseId') courseId: string,
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.syllabusService.update(syllabusId, {
        title: title?.trim(),
        description: description?.trim() || null,
      });
      flashToast(req, 'Changes saved', 'The syllabus has been updated.');
    } catch (e: any) {
      flashToastError(req, 'Could not save', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}`);
  }

  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/delete')
  async deleteSyllabus(
    @Param('courseId') courseId: string,
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Materi, tugas, jawaban, logbook, dan progres ikut terhapus lewat
      // CASCADE di basis data; urutan yang tersisa dirapatkan service.
      await this.syllabusService.remove(syllabusId);
      flashToast(req, 'Syllabus deleted', 'The remaining order was tidied up.');
    } catch (e: any) {
      flashToastError(req, 'Could not delete', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}`);
  }

  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/move')
  async moveSyllabus(
    @Param('courseId') courseId: string,
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Body('to') to: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.syllabusService.reorder(syllabusId, Number(to));
    } catch (e: any) {
      flashToastError(req, 'Could not reorder', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}`);
  }

  // ---- isi satu silabus: materi dan tugas -------------------------------

  @Roles('admin', 'super_admin')
  @Get('manage/:courseId/:syllabusId')
  async manageOne(
    @Param('courseId') courseId: string,
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const syllabus = await this.syllabusService.findOne(syllabusId);
    const quiz = await this.syllabusService.quizFor(syllabusId);
    return res.render('admin/syllabus/detail', {
      user: req.user,
      course: syllabus.course,
      syllabus,
      quiz,
      courseId,
      bareShell: true,
    });
  }

  /**
   * Menambah materi.
   *
   * Berkas PDF diunggah; PPT dan video berupa tautan (Google Slides, YouTube).
   * Pembagian itu bukan pilihan baru - persis yang sudah berlaku di jalur
   * bootcamp (material.controller.ts), supaya admin tidak menemui dua
   * kebiasaan berbeda untuk hal yang sama.
   */
  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/material')
  @UseInterceptors(
    FileInterceptor('upload', multerConfigMemoryOnly),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'syllabus/material',
    resourceType: 'raw',
    // Tidak ada opsi "optional": ValidateFileInterceptor memang melewat sendiri
    // kalau tidak ada berkas yang dikirim, dan itulah yang dipakai untuk PPT
    // dan video yang berupa tautan.
  })
  async addMaterial(
    @Param('courseId') courseId: string,
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Body('title') title: string,
    @Body('fileType') fileType: string,
    @Body('link') link: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const uploaded = (req.body as any).uploadedFileUrls?.[0];
      await this.syllabusService.addMaterial(syllabusId, {
        title,
        file: uploaded || link,
        fileType: (['pdf', 'ppt', 'video'].includes(fileType)
          ? fileType
          : 'pdf') as any,
      });
      flashToast(req, 'Material added', 'Students can open it now.');
    } catch (e: any) {
      flashToastError(req, 'Could not add material', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}/${syllabusId}`);
  }

  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/material/:materialId/delete')
  async removeMaterial(
    @Param('courseId') courseId: string,
    @Param('syllabusId') syllabusId: string,
    @Param('materialId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    materialId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.syllabusService.removeMaterial(materialId);
      flashToast(req, 'Material deleted', 'It is no longer visible to students.');
    } catch (e: any) {
      flashToastError(req, 'Could not delete', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}/${syllabusId}`);
  }

  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/assignment')
  @UseInterceptors(
    FileInterceptor('upload', multerConfigMemoryOnly),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'syllabus/assignment',
    resourceType: 'raw',
    // Tidak ada opsi "optional": ValidateFileInterceptor memang melewat sendiri
    // kalau tidak ada berkas yang dikirim, dan itulah yang dipakai untuk PPT
    // dan video yang berupa tautan.
  })
  async addAssignment(
    @Param('courseId') courseId: string,
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Body('title') title: string,
    @Body('link') link: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const uploaded = (req.body as any).uploadedFileUrls?.[0];
      await this.syllabusService.addAssignment(syllabusId, {
        title,
        file: uploaded || link,
      });
      flashToast(req, 'Assignment added', 'Students can submit against it now.');
    } catch (e: any) {
      flashToastError(req, 'Could not add assignment', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}/${syllabusId}`);
  }

  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/assignment/:assignmentId/delete')
  async removeAssignment(
    @Param('courseId') courseId: string,
    @Param('syllabusId') syllabusId: string,
    @Param('assignmentId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    assignmentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Jawaban student dan komentarnya ikut terhapus lewat CASCADE - tugas
      // yang hilang tidak boleh meninggalkan jawaban yatim.
      await this.syllabusService.removeAssignment(assignmentId);
      flashToast(req, 'Assignment deleted', 'Its submissions were removed too.');
    } catch (e: any) {
      flashToastError(req, 'Could not delete', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}/${syllabusId}`);
  }

  /** Layar penilaian: semua jawaban student atas satu tugas silabus. */
  @Roles('admin', 'super_admin')
  @Get('manage/:courseId/:syllabusId/assignment/:assignmentId/answers')
  async answers(
    @Param('courseId') courseId: string,
    @Param('syllabusId') syllabusId: string,
    @Param('assignmentId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    assignmentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { task, answers } =
      await this.syllabusService.answersForAssignment(assignmentId);
    return res.render('admin/syllabus/answers', {
      user: req.user,
      task,
      answers,
      syllabus: task.syllabus,
      course: task.syllabus.course,
      courseId,
      syllabusId,
      bareShell: true,
    });
  }

  /**
   * Mentor menilai satu jawaban: disetujui, diminta revisi, atau dikembalikan
   * ke antrean. Komentarnya opsional dan disimpan sebagai baris tersendiri.
   */
  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/assignment/:assignmentId/answers/:answerId/review')
  async reviewAnswer(
    @Param('courseId') courseId: string,
    @Param('syllabusId') syllabusId: string,
    @Param('assignmentId') assignmentId: string,
    @Param('answerId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    answerId: string,
    @Body('process') process: string,
    @Body('comment') comment: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.syllabusService.reviewAnswer(
        answerId,
        process as any,
        comment,
      );
      flashToast(req, 'Review saved', 'The student can see it now.');
    } catch (e: any) {
      flashToastError(req, 'Could not save review', e?.message || 'Try again.');
    }
    return res.redirect(
      `/program/syllabus/manage/${courseId}/${syllabusId}/assignment/${assignmentId}/answers`,
    );
  }

  /**
   * Membuat kuis untuk satu silabus. SATU kuis per silabus.
   *
   * Tidak lewat QuizService.create(): method itu sekaligus membuka
   * QuizProgress berdasarkan kehadiran dan logbook sesi terakhir, dan jalur
   * silabus memang tidak punya kehadiran. Pertanyaannya tetap dikelola di
   * layar kuis yang sudah ada (/quiz/:quizId) - tidak ada gunanya membuat
   * layar kedua untuk hal yang sama.
   */
  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/quiz')
  async createQuiz(
    @Param('courseId') courseId: string,
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Body('quizName') quizName: string,
    @Body('minScore') minScore: string,
    @Body('duration') duration: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.syllabusService.createQuiz(syllabusId, {
        quizName,
        minScore: Number(minScore),
        duration: Number(duration),
      });
      flashToast(req, 'Quiz created', 'Add its questions next.');
    } catch (e: any) {
      flashToastError(req, 'Could not create quiz', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}/${syllabusId}`);
  }

  @Roles('admin', 'super_admin')
  @Post('manage/:courseId/:syllabusId/quiz/:quizId/delete')
  async removeQuiz(
    @Param('courseId') courseId: string,
    @Param('syllabusId') syllabusId: string,
    @Param('quizId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    quizId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Pertanyaan, jawaban, nilai, dan progres ikut terhapus lewat CASCADE.
      await this.syllabusService.removeQuiz(quizId);
      flashToast(req, 'Quiz deleted', 'Its questions and scores went with it.');
    } catch (e: any) {
      flashToastError(req, 'Could not delete quiz', e?.message || 'Try again.');
    }
    return res.redirect(`/program/syllabus/manage/${courseId}/${syllabusId}`);
  }

  /** Siapa sudah menyelesaikan silabus apa - pengganti layar absensi. */
  @Roles('admin', 'super_admin')
  @Get('completion/:courseId')
  async completion(
    @Param('courseId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const course = await this.syllabusService.courseFor(courseId);
    const data = await this.syllabusService.completionFor(courseId);
    return res.render('admin/syllabus/completion', {
      user: req.user,
      course,
      syllabi: data.syllabi,
      rows: data.rows,
      total: data.total,
      bareShell: true,
    });
  }

  @Roles('user')
  @Post('detail/:syllabusId/complete')
  async complete(
    @Param('syllabusId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    syllabusId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // markComplete sendiri yang menolak silabus terkunci - penjagaan ada di
      // server, bukan pada tombol yang disembunyikan.
      await this.syllabusService.markComplete(syllabusId, req.user!.id);
      flashToast(req, 'Syllabus completed', 'The next one is now open.');
    } catch (e: any) {
      flashToastError(
        req,
        'Could not mark as complete',
        e?.message || 'Please try again in a moment.',
      );
    }
    return res.redirect(`/program/syllabus/detail/${syllabusId}`);
  }
}
