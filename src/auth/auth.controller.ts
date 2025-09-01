import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Res,
  Req,
  Param,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor (private readonly authService: AuthService){}
  @Get('login')
  async getLogin(@Res() res: Response, @Req() req:any) {
    res.render('login');
  }

  @Get('daftar/:id')
  async daftarKelas(@Param('id') id:number ,@Res() res: Response, @Req() req:any) {
    const kelas = await this.authService.findKelas(id)
    if(!req.user){
    res.render('login');
    }else{
    res.render('user/daftarKelas', {user: req.user, kelas});
    }
  }

  @Get('coba')
  async coba(@Res() res: Response,){
    res.render('user/pembayaran')
  }

@Post('login')
  async login(@Body() body: any, @Request() req: any, @Res() res: Response) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      
      if (!user) {
        req.flash('error', 'Email atau password salah');
        return res.redirect('/login');
      }

      req.login(user, (err) => {
        if (err) {
          req.flash('error', 'Terjadi kesalahan saat login');
          return res.redirect('/login');
        }
        res.redirect('/dashboard');
      });
    } catch (error) {
      req.flash('error', 'Email atau password salah');
      return res.redirect('/login');
    }
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
    if(req.user){
    if(req.user.role === "super_admin"){
      res.redirect('/users');
    } else if(req.user.role === "admin"){
      res.redirect('/kelass');
    }else if(req.user.role === "user"){
      res.render('dashboard', { user: req.user, kelas });
    }
    }else{
      res.render('dashboard', { user: req.user, kelas });
    }
  }
}