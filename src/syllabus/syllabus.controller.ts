import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { flashToast, flashToastError } from 'src/common/utils/toast.util';
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

    return res.render('user/learning/syllabus', {
      user: req.user,
      syllabus,
      view,
      course: syllabus.course,
      caps: capabilitiesForCourse(syllabus.course),
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
