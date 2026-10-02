import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { Request, Response } from 'express';

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  async setLang(
    @Body('lang') lang: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const allowed = ['id', 'en', 'ja'];
    const selected = allowed.includes(lang) ? lang : 'id';

    res.cookie('lang', selected, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    const backUrl = req.headers.referer || '/';

    return res.redirect(backUrl);
  }
}
