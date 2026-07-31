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
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  async getLogin(@Res() res: Response, @Req() req: any) {
    if (req.user) {
      return res.redirect('/dashboard');
    }
    res.render('login');
  }

  @Get('register/:id')
  async registerCourse(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const course = await this.authService.findCourse(id);
    if (!req.user) {
      res.render('login');
    } else {
      res.render('user/mycourse', { user: req.user, course });
    }
  }

  @Get('register')
  async regis(@Res() res: Response) {
    res.render('regis');
  }

  @Post('register')
  async createAcount(
    @Body() createUserDto: CreateUserDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.createAcount(createUserDto);
      req.flash('success', 'Registration successful! Please login');
      res.redirect('/users/send-verify-email?token=' + user.verificationToken);
      
    } catch (error: any) {
      req.flash('error', error.message || 'Registration failed');
      // res.redirect('/login');
      res.redirect('/register');
    }
  }

  @Post('login')
async login(@Body() body: any, @Request() req: any, @Res() res: Response) {
try {
const user = await this.authService.validateUser(
body.email,
body.password,
);

if (user!.isVerified === false) {
res.redirect('/users/send-verify-email?token=' + user!.verificationToken);
} else {
req.login(user, (err) => {
if (err) {
req.flash('error', 'Email not verified');
return res.redirect('/login');
}
res.redirect('/dashboard');
});
}
} catch (error: any) {
req.flash('error', error.message || 'Email or password is incorrect');
return res.redirect('/login');
}
}

  @Get('logout')
  logout(@Req() req: any, @Res() res: Response) {
    req.logout((err) => {
      if (err) {
        return res.status(500).send({ message: 'Logout failed', error: err });
      }

      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
      });
    });
  }

  @Get('session-expired')
sessionExpired(@Res() res: Response) {
    res.redirect('/login');
}
}
