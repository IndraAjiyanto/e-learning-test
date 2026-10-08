import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { flashToastError } from 'src/common/utils/toast.util';
import { CertificatesService } from './certificates.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) { }

  @Roles('user')
  @Get(':courseId/preview')
  async preview(
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!req.user) {
      return res.redirect('/login');
    }

    try {
      const html = await this.certificatesService.getPreviewHtml(
        courseId,
        req.user.id,
      );
      return res.type('html').send(html);
    } catch (error: any) {
      return res
        .status(error?.status ?? 500)
        .type('text')
        .send(error?.message || 'Certificate preview is not available.');
    }
  }

  @Roles('user')
  @Get(':courseId/download')
  async download(
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!req.user) {
      return res.redirect('/login');
    }

    try {
      const html = await this.certificatesService.getPreviewHtml(
        courseId,
        req.user.id,
      );
      const pdf = await this.certificatesService.renderCertificatePdf(html);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="certificate-${courseId}.pdf"`,
      );
      return res.type('application/pdf').send(pdf);
    } catch (error: any) {
      return res
        .status(error?.status ?? 500)
        .type('text')
        .send(error?.message || 'Certificate download is not available.');
    }
  }

  @Roles('user')
  @Get(':courseId')
  async generate(
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!req.user) {
      return res.redirect('/login');
    }

    try {
      const certificate = await this.certificatesService.generateCertificate(
        courseId,
        req.user.id,
      );

      // Route ini sebelumnya me-render view 'user/certificates/detail' yang TIDAK
      // ADA di repo, jadi tombol "Download Certificate" di shell selalu berakhir
      // 500. generateCertificate() sudah mengunggah PDF-nya ke Cloudinary dan
      // mengembalikan URL publiknya, jadi yang benar adalah mengantar user ke
      // berkas itu — bukan ke halaman perantara yang isinya cuma satu tautan.
      if (!certificate?.certificate) {
        flashToastError(
          req,
          'Certificate not ready',
          'The file has not been generated yet. Please try again in a moment.',
        );
        return res.redirect('/users/profile?tab=certificate');
      }

      return res.redirect(certificate.certificate);
    } catch (error: any) {
      console.error('Gagal membuat sertifikat:', error?.message ?? error);
      req.flash(
        'error',
        error?.message ||
        'Sertifikat gagal dibuat. Hubungi admin bila berlanjut.',
      );
      return res.redirect('/users/profile?tab=certificate');
    }
  }
}
