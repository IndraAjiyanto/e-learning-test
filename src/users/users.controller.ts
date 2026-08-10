import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  UseInterceptors,
  UploadedFile,
  Query,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ============================================
  // PUBLIC ROUTES - Forgot & Reset Password (No Auth Required)
  // ============================================

  @Get('forgot-password')
  async forgotPasswordPage(
    @Res() res: Response,
    @Req() req: Request,
    @Query('token') token: string,
  ) {
    if (token === undefined) {
      return res.render('forgot-password');
    }
    const user = await this.usersService.findUserByTokenPassword(token);
    if (user.isVerified) {
      const remainingMs = await this.usersService.tokenPasswordExpired(token);
      return res.render('forgot-password', { remainingMs: remainingMs });
    } else {
      req.flash('error', 'Please verify your email first');
      res.redirect('/users/send-verify-email?token=' + user.verificationToken);
    }
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const token = await this.usersService.forgotPassword(forgotPasswordDto);
      req.flash(
        'success',
        'Password reset link has been sent to your email. Please check your inbox.',
      );
      res.redirect('/users/forgot-password?token=' + token);
    } catch (error: any) {
      const user = await this.usersService.findUserByEmail(
        forgotPasswordDto.email,
      );
      req.flash(
        'error',
        error.message || 'Failed to process password reset request',
      );
      res.redirect('/users/forgot-password?token=' + user.resetPasswordToken);
    }
  }

  @Get('reset-password')
  async resetPasswordPage(
    @Query('token') token: string,
    @Query('email') email: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.usersService.validateResetToken(token);
      return res.render('reset-password', { token });
    } catch (error: any) {
      const token = await this.usersService.findUserByEmail(email);
      req.flash('error', 'Invalid or missing reset token');
      return res.redirect(
        '/users/forgot-password?token=' + token.resetPasswordToken,
      );
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.usersService.resetPassword(resetPasswordDto);
      req.flash(
        'success',
        'Password has been reset successfully! You can now login with your new password.',
      );
      res.redirect('/login');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to reset password');
      res.redirect(`/users/reset-password?token=${resetPasswordDto.token}`);
    }
  }

  // ============================================
  // PUBLIC ROUTES - Verify account (No Auth Required)
  // ============================================

  @Post('send-verify-email')
  async sendVerifyEmailPage(
    @Res() res: Response,
    @Req() req: Request,
    @Query('token') token: string,
  ) {
    try {
      const user = await this.usersService.sendVerificationEmail(token);
      req.flash('success', 'Verification email sent successfully');
      res.redirect('/users/send-verify-email?token=' + user.verificationToken);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to send verification email');
      res.redirect('/users/send-verify-email');
    }
  }

  @Get('send-verify-email')
  async sendVerifyEmail(
    @Query('token') token: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const remainingMs = await this.usersService.tokenExpired(token);
      const user = await this.usersService.findUserByToken(token);
      return res.render('verify-email', {
        remainingMs: remainingMs,
        user: user,
      });
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to send verification email');
      return res.render('verify-email');
    }
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Query('email') email: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.usersService.verifyEmail(token);
      req.flash('success', 'Email verified successfully! You can now login.');
      res.redirect('/users/verify-email-success');
    } catch (error: any) {
      const user = await this.usersService.findUserByEmail(email);
      req.flash('error', error.message || 'Email verification failed');
      res.redirect('/users/send-verify-email?token=' + user.verificationToken);
    }
  }

  @Get('verify-email-success')
  async verifyEmailSuccess(
    @Res() res: Response
  ){
    res.render('verify-email-success')
  }


  // ============================================
  // PROTECTED ROUTES - Require Authentication
  // ============================================

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'profile_user',
    skipTransformation: true,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createUserDto.profile = req.body.uploadedImageUrls?.[0];
      await this.usersService.create(createUserDto);
      req.flash('success', 'User created successfully');
      res.redirect('/users');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create user');
      res.redirect('/users');
    }
  }

  @Roles('user', 'admin', 'super_admin')
  @Get('profile')
  async profile(@Res() res: Response, @Req() req: Request) {
    if (!req.user) {
      return res.redirect('/login');
    }
    const user = await this.usersService.findOne(req.user.id);
    const portfolio = await this.usersService.findPortfolio(req.user.id);
    return res.render('profile/index', { user: user, portfolio });
  }

  @Roles('user', 'admin', 'super_admin')
  @Get('profile/password')
  async editPassword(@Res() res: Response, @Req() req: Request) {
    return res.render('profile/editPassword', { user: req.user });
  }

  @Roles('user', 'admin', 'super_admin')
  @Get('profile/info_account')
  async editInfoAkun(@Res() res: Response, @Req() req: Request) {
    return res.render('profile/editInfo', { user: req.user });
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    // const users = await this.usersService.findAll();
    res.render('super_admin/user/index', { user: req.user });
  }

  @Roles('super_admin')
  @Get('filter')
  async filterUsers(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = parseInt(page || '1', 10);
    const itemsPerPage = parseInt(limit || '5', 10);

    const result = await this.usersService.findAllPaginated({
      search: search || undefined,
      page: currentPage,
      limit: itemsPerPage,
    });

    return res.json({
      data: result.data,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / itemsPerPage),
      currentPage,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:userId')
  async formEdit(
    @Param('userId') userId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const users = await this.usersService.findOne(userId);
    res.render('super_admin/user/edit', { user: req.user, users });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/user/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('profile/:id')
  async detailUser(
    @Param('id') userId: number,
    @Res() res: Response,
  ) {

    const user = await this.usersService.findOne(userId);
    console.log('ID PARAM:', userId);
    return res.render('super_admin/user/detail', { user });
  }

  @Roles('user', 'admin', 'super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      if (req.user!.id == id) {
        await this.usersService.update(id, updateUserDto);
        req.flash('success', 'User successfully updated');
        res.redirect('/users/profile');
      } else {
        req.flash('error', 'Failed to update user');
      }
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update user');
      res.redirect('/users/profile');
    }
  }

  @Roles('super_admin')
  @Patch('super_admin/:userId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'profile_user',
    skipTransformation: true,
  })
  async updateAdmin(
    @UploadedFile() profile: Express.Multer.File,
    @Param('userId') userId: number,
    @Res() res: Response,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    try {
      const user = await this.usersService.findOne(userId);
      if (profile) {
        if (user.profile) {
          await this.usersService.deleteFile(user.profile);
        }
        updateUserDto.profile = req.body.uploadedImageUrls?.[0];
      }
      await this.usersService.update(userId, updateUserDto);
      req.flash('success', 'User successfully updated');
      res.redirect('/users');
    } catch (error: any) {
      req.flash('error', error.message || 'User failed to update');
      res.redirect('/users');
    }
  }

  @Roles('user', 'admin', 'super_admin')
  @Patch('password/:id')
  async updatePassword(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      if (req.user!.id == id) {
        await this.usersService.updatePassword(id, updatePasswordDto);
        req.flash('success', 'Password successfully updated');
        res.redirect('/users/profile');
      } else {
        req.flash('error', 'Unauthorized access');
        res.redirect('/users/profile');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update password';
      req.flash('error', errorMessage);
      res.redirect('/users/profile');
    }
  }

  @Roles('user', 'admin', 'super_admin')
  @Patch('update/profile/:userId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'profile_user',
    skipTransformation: true,
  })
  async updateProfile(
    @Param('userId') userId: number,
    @Res() res: Response,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() profile: Express.Multer.File,
    @Req() req: Request,
  ) {
    try {
      const user = await this.usersService.findOne(userId);
      if (profile) {
        if (user.profile) {
          await this.usersService.deleteFile(user.profile);
        }
        updateProfileDto.profile = req.body.uploadedImageUrls?.[0];
      }

      const userIdNum = Number(userId);

      if (req.user!.id === userIdNum) {
        await this.usersService.updateProfile(userIdNum, updateProfileDto);
        req.flash('success', 'update profile success');
        res.redirect('/users/profile');
      } else {
        req.flash('error', 'update profile failed');
        res.redirect('/users/profile');
      }
    } catch (error: any) {
      req.flash('error', error.message || 'update profile failed');
      res.redirect('/users/profile');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        req.flash('error', 'User not found');
        res.redirect('/users');
      }
      if (user.profile) {
        await this.usersService.deleteFile(user.profile);
      }

      await this.usersService.remove(id);

      req.flash('success', 'User successfully deleted');
      res.redirect('/users');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete user');
      res.redirect('/users');
    }
  }
}
