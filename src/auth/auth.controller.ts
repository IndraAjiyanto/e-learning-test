type PassportRequest = Request & {
  login: (user: unknown, done: (err: unknown) => void) => void;
  logout: (done: (err: unknown) => void) => void;
};
import { Controller, Get, Post, Res, Req, Param, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserActivityService } from 'src/user_activity/user-activity.service';
import { flashToastWarning } from 'src/common/utils/toast.util';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userActivityService: UserActivityService,
  ) {}

  @Get('login')
  getLogin(@Res() res: Response, @Req() req: Request) {
    if (req.user && req.user.isVerified) {
      if (req.user.role === 'user') {
        return res.redirect('/users/profile');
      } else if (req.user.role === 'super_admin') {
        return res.redirect('/information');
      } else if (req.user.role === 'admin') {
        return res.redirect('/program');
      }
      return res.redirect('/dashboard');
    }
    res.render('login');
  }

  @Get('register/:id')
  async registerCourse(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course = await this.authService.findCourse(id);
    if (!req.user) {
      res.render('login');
    } else {
      res.render('user/mycourse', { user: req.user, course });
    }
  }

  @Get('register')
  regis(@Res() res: Response) {
    res.render('regis');
  }

  @Post('register')
  async createAcount(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.createAcount(createUserDto);
      req.flash('success', 'Registration successful! Please login');
      res.redirect('/users/send-verify-email?token=' + user.verificationToken);
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Registration failed');
      // res.redirect('/login');
      res.redirect('/register');
    }
  }

  @Post('login')
  async login(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const passportReq = req as PassportRequest;
    try {
      const email = typeof body.email === 'string' ? body.email : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const user = await this.authService.validateUser(email, password);

      if (user!.isVerified === false) {
        passportReq.login(user, (err: unknown) => {
          if (err) {
            req.flash('error', 'Email not verified');
            return res.redirect('/login');
          }
          return res.redirect('/users/send-verify-email');
        });
      } else {
        passportReq.login(user, (err: unknown) => {
          if (err) {
            req.flash('error', 'Login failed');
            return res.redirect('/login');
          }
          this.userActivityService
            .markActive(user!.id, req.sessionID)
            .catch(() => undefined);

          if (user!.resetPasswordToken === 'MUST_CHANGE_PASSWORD') {
            flashToastWarning(
              req,
              'Security Alert',
              'Please change your temporary password in your profile settings for security.',
            );
            if (user!.role === 'user') {
              return res.redirect('/users/profile?tab=password');
            }
          }

          if (user!.role === 'user') {
            return res.redirect('/users/profile');
          } else if (user!.role === 'super_admin') {
            return res.redirect('/information');
          } else if (user!.role === 'admin') {
            return res.redirect('/program');
          }
          return res.redirect('/dashboard');
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Email or password is incorrect');
      return res.redirect('/login');
    }
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const passportReq = req as PassportRequest;
    const userId = req.user?.id;
    if (userId) {
      await this.userActivityService
        .markInactive(userId)
        .catch(() => undefined);
    }
    passportReq.logout((err: unknown) => {
      if (err) {
        return res.status(500).send({
          message: 'Logout failed',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
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
