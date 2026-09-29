import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FinalAssignmentService } from './final_assignment.service';
import { ReviewUserAssignmentDto } from './dto/review-user-assignment.dto';
import { SubmitFinalAssignmentDto } from './dto/submit-final-assignment.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Request, Response } from 'express';
import { flashToast, flashToastError } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Controller('final-assignment')
export class FinalAssignmentController {
  constructor(
    private readonly finalAssignmentService: FinalAssignmentService,
  ) {}

  @Roles('admin', 'super_admin', 'user')
  @Get('course/:courseId')
  async getByCourse(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const finalAssignment = await this.finalAssignmentService.findByCourse(
      courseId,
      false,
    );
    return res.json({
      success: true,
      data: finalAssignment,
    });
  }

  @Roles('admin', 'super_admin')
  @Post('delete/:courseId')
  async delete(
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.finalAssignmentService.remove(courseId);
    flashToast(
      req,
      'Final Assignment Deleted',
      'The final assignment has been removed successfully.',
    );
    return res.redirect(`/program/detail/program/admin/${courseId}`);
  }

  /**
   * Halaman final assignment untuk peserta.
   *
   * Bentuk halaman ini sengaja sama dengan tugas mingguan
   * (src/views/user/assignments.hbs): brief di kiri, kartu kiriman di kanan.
   * Yang membedakan hanya isi kolomnya - rich text EditorJS vs berkas PDF.
   * Kerangkanya dipakai bersama lewat
   * `components/ui/learning/assignment_page/*`.
   *
   * `findOneForSubmission` kelihatan tipis, tapi menentukan. Tanpa itu,
   * `@Roles('user')` hanya membuktikan orang ini peserta program DI MANA SAJA,
   * dan UUID final assignment program lain bisa ditebak untuk mengintip brief
   * program itu.
   */
  @Roles('user')
  @Get('submission/:id')
  async submissionPage(
    @Param('id') finalAssignmentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = req.user!.id;
    const finalAssignment =
      await this.finalAssignmentService.findOneForSubmission(
        finalAssignmentId,
        userId,
      );
    const submission = await this.finalAssignmentService.findSubmissionByUser(
      finalAssignment.id,
      userId,
    );

    return res.render('user/learning/final_assignment', {
      user: req.user,
      finalAssignment,
      submission,
      bareShell: true,
    });
  }

  /**
   * Kirim atau perbarui final assignment milik peserta yang sedang login.
   *
   * Satu rute untuk dua hal: `submitAssignment` di service lebih dulu mencari
   * baris kiriman peserta itu, jadi mengirimi tautan kedua kali berarti
   * mengganti, bukan membuat baris kedua.
   *
   * Form-nya POST biasa lalu redirect dengan flash, sama seperti tugas mingguan
   * di `answer_answers.controller.ts`. Alasannya bukan sekadar konsistensi:
   * halaman ini harus tetap bisa mengirim jawaban saat JavaScript gagal dimuat,
   * dan redirect mengembalikan peserta ke brief yang sama lengkap dengan toast
   * hasilnya.
   *
   * Kegagalan pun tetap dialihkan, bukan dilempar sebagai halaman error:
   * peserta yang salah mengetik tautan harus kembali ke brief-nya, bukan ke
   * layar 500. `res.redirect` pada blok catch memakai try/catch sendiri supaya
   * kegagalan di dalam redirect tidak menutupi pesan aslinya.
   */
  @Roles('user')
  @Post('submission/:id')
  async submit(
    @Param('id') finalAssignmentId: string,
    @Body() dto: SubmitFinalAssignmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const backUrl = `/final-assignment/submission/${finalAssignmentId}`;
    const filePath = String(dto.filePath ?? '').trim();

    try {
      if (!filePath) {
        throw new BadRequestException('filePath is required');
      }

      // req.user dijamin ada oleh AuthenticatedGuard di atas kelas ini.
      const userId = req.user!.id;
      const finalAssignment =
        await this.finalAssignmentService.findOneForSubmission(
          finalAssignmentId,
          userId,
        );

      // `submitAssignment` selalu menulis ulang status jadi 'process', jadi tanpa
      // penjaga di sini satu POST cukup untuk mengembalikan nilai yang sudah
      // disetujui ke antrean penilaian ulang. Halaman student memang tidak
      // menampilkan form untuk kiriman yang approved; endpoint ini yang
      // menyamakan keduanya, supaya mengetik URL secara manual tidak memberi
      // hak yang tidak ditawarkan halaman.
      const existing = await this.finalAssignmentService.findSubmissionByUser(
        finalAssignment.id,
        userId,
      );
      if (existing?.status === 'approved') {
        throw new BadRequestException(
          'This submission has already been approved and can no longer be changed',
        );
      }

      await this.finalAssignmentService.submitAssignment(
        finalAssignment.id,
        userId,
        filePath,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Submission failed';
      flashToastError(req, 'Failed to Send Answer', message);
      return res.redirect(backUrl);
    }

    flashToast(
      req,
      'Answer Sent',
      'Your answer has been sent and is waiting for review.',
    );
    return res.redirect(backUrl);
  }

  @Roles('admin', 'super_admin')
  @Post('submission/:id/review')
  @HttpCode(HttpStatus.OK)
  async reviewSubmission(
    @Param('id') submissionId: string,
    @Body() dto: ReviewUserAssignmentDto,
    @Req() req: Request,
  ) {
    const updated = await this.finalAssignmentService.reviewSubmission(
      submissionId,
      dto.status,
      dto.comment,
      req.user,
    );
    return {
      success: true,
      message: `Submission status updated to ${dto.status}.`,
      data: updated,
    };
  }
}

