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
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

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
        res.status(500).send({ message: 'Login gagal', error: err });
      }
      res.redirect('/dashboard');
    });
  }

  @Get('logout')
  logout(@Req() req: any, @Res() res: Response) {
    req.logout(() => {
      res.redirect('/login');
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Get('dashboard')
  getProtected(@Req() req: any, @Res() res: Response) {
    res.render('dashboard', { user: req.user });
  }
}
