import {
  Controller,
  Get,
  Post,
  Request,
  Res,
  Req,
  Param,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller()
export class AuthController {
  constructor (private readonly authService: AuthService){}
  @Get('login')
  async getLogin(@Res() res: Response, @Req() req:Request) {
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
    res.render('user/dashboardlain')
  }

  @Get('register')
  async regis(@Res() res: Response){
    res.render('regis')
  }

  @Post('register')
  async createAcount(@Body() createUserDto: CreateUserDto, @Req() req:any, @Res() res:Response){
    try {
      await this.authService.createAcount(createUserDto)
      req.flash('success', 'success regis')
      res.redirect('/login')
    } catch (error) {
      console.log(error)
      req.flash('error', 'failed to regis')
            res.redirect('/login')
    }
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



}