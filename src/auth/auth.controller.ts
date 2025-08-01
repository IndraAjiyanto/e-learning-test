import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
  @Get('login')
  getLogin(@Res() res: Response) {
    res.render('login');
  }

@UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res() res: Response) {

    req.login(req.user, (err) => {
      if (err) {
        return res.status(500).send({ message: 'Login gagal', error: err });
      }
      return res.redirect('/protected');
    });
  }

  @Get('logout')
  logout(@Req() req: any, @Res() res: Response) {
    req.logout(() => {
      res.redirect('/login');
    });
  }

  @Get('protected')
  getProtected(@Req() req: any, @Res() res: Response) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
    res.send(`Halo ${req.user.username}, kamu sudah login!`);
  }
}
