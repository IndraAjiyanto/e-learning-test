import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

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

    const biodata = await this.certificatesService.findBiodata(req.user.id);
    if (!biodata) {
      req.flash('info', 'Lengkapi biodata terlebih dahulu sebelum mengunduh sertifikat.');
      return res.redirect('/users/profile?tab=profile');
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
        req.flash('error', 'Sertifikat belum tersedia. Coba lagi beberapa saat lagi.');
        return res.redirect('/users/profile?tab=certificate');
      }

      return res.redirect(certificate.certificate);
    } catch (error: any) {
      console.error('Gagal membuat sertifikat:', error?.message ?? error);
      req.flash(
        'error',
        error?.message || 'Sertifikat gagal dibuat. Hubungi admin bila berlanjut.',
      );
      return res.redirect('/users/profile?tab=certificate');
    }
  }
}
