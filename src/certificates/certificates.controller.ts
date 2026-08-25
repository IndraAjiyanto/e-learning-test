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
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (req.user) {
      const biodata = await this.certificatesService.findBiodata(req.user.id);
      if (!biodata) {
        req.flash('info', 'isi biodata terlebih dahulu');
        res.redirect('/users/profile');
      } else {
        const certificates = await this.certificatesService.generateCertificate(
          courseId,
          req.user.id,
        );
        res.redirect(certificates.certificate);
      }
    }
  }
}
