import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  Res,
  Req,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationsDto } from './dto/create-registrations.dto';
import { UpdateRegistrationsDto } from './dto/update-registrations.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { Request, Response } from 'express';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';

@UseGuards(AuthenticatedGuard)
@Controller('registration')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Roles('user')
  @Post(':userId/:courseId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'registration',
  })
  async create(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() createRegistrationDto: CreateRegistrationsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      interface RegistrationReqBody {
        uploadedImageUrls?: string[];
        user_fullname?: string;
        user_email?: string;
        user_no?: string;
        current_status?: string;
        referal_source?: string;
        attend_program?: string;
      }
      const b = req.body as RegistrationReqBody;
      console.log('🔵 [Registration] Attempt:', {
        userId,
        courseId,
        file: req.file,
        body: b,
        uploadedImageUrls: b?.uploadedImageUrls,
      });
      createRegistrationDto.file = b?.uploadedImageUrls?.[0] || '';
      console.log('🔵 [Registration] File URL:', createRegistrationDto.file);
      createRegistrationDto.courseId = courseId;
      createRegistrationDto.userId = userId;
      createRegistrationDto.process = 'approved';
      createRegistrationDto.user_fullname = b?.user_fullname || '';
      createRegistrationDto.user_email = b?.user_email || '';
      createRegistrationDto.user_no = b?.user_no || '';
      createRegistrationDto.current_status = b?.current_status || '';
      createRegistrationDto.referal_source = b?.referal_source || '';
      createRegistrationDto.attend_program = b?.attend_program === 'true';
      const registration = await this.registrationsService.create(
        createRegistrationDto,
      );
      const isJson =
        Boolean(req.xhr) ||
        Boolean(req.headers.accept?.includes('application/json')) ||
        req.headers['x-requested-with'] === 'XMLHttpRequest';

      if (registration == false) {
        await this.registrationsService.deleteFile(createRegistrationDto.file);
        if (isJson) {
          return res.status(400).json({
            success: false,
            message: 'You have already registered for this program',
          });
        }
        req.flash('info', 'you have already registered for this program');
        return res.redirect(`/users/profile?tab=history-payment#pendaftaran`);
      } else if (!registration) {
        if (isJson) {
          return res.status(400).json({
            success: false,
            message: 'Registration failed. User or course not found.',
          });
        }
        req.flash('error', 'Registration failed');
        return res.redirect(`/users/profile?tab=history-payment#pendaftaran`);
      } else {
        try {
          await this.registrationsService.addUserToCourse(userId, courseId);
        } catch {
          // ignore
        }
        if (isJson) {
          return res.status(200).json({
            success: true,
            message:
              'Registration successful! You are now enrolled in the program.',
            redirectUrl: '/users/profile?tab=dashboard',
          });
        }
        req.flash(
          'success',
          'Registration successful! You are now enrolled in the program.',
        );
        return res.redirect(`/users/profile?tab=dashboard`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('🔴 [Registration] Error:', error);
      const isJson =
        Boolean(req.xhr) ||
        Boolean(req.headers.accept?.includes('application/json')) ||
        req.headers['x-requested-with'] === 'XMLHttpRequest';
      if (isJson) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Registration failed',
        });
      }
      req.flash('error', err.message || 'Registration failed');
      return res.redirect(`/users/profile?tab=history-payment#pendaftaran`);
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll() {
    return await this.registrationsService.findAll();
  }

  @Roles('super_admin')
  @Patch(':proses/:pendaftaranId')
  async update(
    @Param('pendaftaranId') registrationId: string,
    @Param('proses') processStatus: string,
    @Body() updateRegistrationDto: UpdateRegistrationsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const registration =
        await this.registrationsService.findOne(registrationId);
      if (!registration) {
        return null;
      }
      if (processStatus === 'approved' || processStatus === 'acc') {
        updateRegistrationDto.file = registration['file'];
        updateRegistrationDto.userId = registration['user']['id'];
        updateRegistrationDto.courseId = registration['course']['id'];
        updateRegistrationDto.process = 'approved';
        await this.registrationsService.update(
          registrationId,
          updateRegistrationDto,
        );
        try {
          await this.registrationsService.addUserToCourse(
            registration['user']['id'],
            registration['course']['id'],
          );
        } catch {
          // ignore
        }

        req.flash('success', 'Process successfully changed to approved');
        res.redirect(
          `/program/detail/program/admin/${registration['course']['id']}`,
        );
      } else if (processStatus === 'rejected') {
        updateRegistrationDto.file = registration['file'];
        updateRegistrationDto.userId = registration['user']['id'];
        updateRegistrationDto.courseId = registration['course']['id'];
        updateRegistrationDto.process = 'rejected';
        await this.registrationsService.update(
          registrationId,
          updateRegistrationDto,
        );
        try {
          await this.registrationsService.removeCourseUser(
            registration['user']['id'],
            registration['course']['id'],
          );
        } catch {
          // ignore
        }
        req.flash('success', 'Process successfully changed to rejected');
        res.redirect(
          `/program/detail/program/admin/${registration['course']['id']}`,
        );
      }
    } catch (error: unknown) {
      const err = error as Error;
      const registration =
        await this.registrationsService.findOne(registrationId);
      req.flash('error', err.message || 'Failed to update process');
      res.redirect(
        `/program/detail/program/admin/${registration['course']['id']}`,
      );
    }
  }
}
