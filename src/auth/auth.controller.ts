import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Res,
  Req,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor (private readonly authService: AuthService){}
  @Get('login')
  getLogin(@Res() res: Response) {
    res.render('login');
  }

  @Get('daftar/:id')
  async daftarKelas(@Param('id') id:number ,@Res() res: Response, @Req() req:any) {
    const kelas = await this.authService.findKelas(id)
    if(!req.user){
    res.render('login');
    }else{
    res.render('daftarKelas', {user: req.user, kelas});
    }
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
  req.logout((err) => {
    if (err) {
      return res.status(500).send({ message: 'Logout gagal', error: err });
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });
}


  @Get('dashboard')
  async getProtected(@Req() req: any, @Res() res: Response) {
    const kelas =  await this.authService.findAllKelas();
    res.render('dashboard', { user: req.user, kelas });
  }
}