import {
  Controller,
  Get,
  Param,
  Res,
  Req,
} from '@nestjs/common';
import { SertifikatService } from './sertifikat.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('sertifikat')
export class SertifikatController {
  constructor(private readonly sertifikatService: SertifikatService) {}

  @Roles('user')
  @Get(':kelasId')
  async generate(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (req.user) {
      const biodata = await this.sertifikatService.findBiodata(req.user.id);
      if (!biodata) {
        req.flash('info', 'isi biodata terlebih dahulu');
        res.redirect('/users/profile');
      } else {
        const sertifikat = await this.sertifikatService.generateCertificate(
          kelasId,
          req.user.id,
        );
        res.render('user/sertifikat/detail', { user: req.user, sertifikat });
      }
    }
  }
}
