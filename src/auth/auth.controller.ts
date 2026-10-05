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
import { UserActivityService } from 'src/user_activity/user-activity.service';
import {
  flashToast,
  flashToastError,
  flashToastInfo,
  flashToastWarning,
} from 'src/common/utils/toast.util';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userActivityService: UserActivityService,
  ) {}

  @Get('login')
  async getLogin(@Res() res: Response, @Req() req: any) {
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
      flashToast(
        req,
        'Registration Successful',
        'Verification email has been sent. Please check your inbox.',
      );
      res.redirect('/users/send-verify-email?token=' + user.verificationToken);
    } catch (error: any) {
      flashToastError(
        req,
        'Registration Failed',
        error.message || 'Registration failed',
      );
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
        req.login(user, (err) => {
          if (err) {
            flashToastError(req, 'Login Failed', 'Email not verified');
            return res.redirect('/login');
          }
          return res.redirect('/users/send-verify-email');
        });
      } else {
        req.login(user, (err) => {
          if (err) {
            flashToastError(req, 'Login Failed', 'Login failed');
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
    } catch (error: any) {
      flashToastError(
        req,
        'Login Failed',
        error.message || 'Email or password is incorrect',
      );
      return res.redirect('/login');
    }
  }

  @Get('logout')
  async logout(@Req() req: any, @Res() res: Response) {
    const userId = req.user?.id;
    if (userId) {
      await this.userActivityService
        .markInactive(userId)
        .catch(() => undefined);
    }
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
