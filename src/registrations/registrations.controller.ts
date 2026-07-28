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
  constructor(private readonly pendaftaranService: RegistrationsService) {}

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
    @Param('userId') userId: number,
    @Param('courseId') courseId: number,
    @Body() createPendaftaranDto: CreateRegistrationsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      console.log('🔵 [Registration] Attempt:', { userId, courseId, file: req.file, body: req.body, uploadedImageUrls: req.body.uploadedImageUrls });
      createPendaftaranDto.file = req.body.uploadedImageUrls?.[0];
      console.log('🔵 [Registration] File URL:', createPendaftaranDto.file);
      createPendaftaranDto.courseId = courseId;
      createPendaftaranDto.userId = userId;
      createPendaftaranDto.process = 'proces';
      const pendaftaran =
        await this.pendaftaranService.create(createPendaftaranDto);
      console.log('🔵 [Registration] Result:', pendaftaran);
      if (pendaftaran == false) {
        await this.pendaftaranService.deleteFile(createPendaftaranDto.file);
        req.flash(
          'info',
          'you have already submitted the registration proof, please wait for further information from the admin',
        );
        res.redirect(`/payment/history/${userId}#pendaftaran`);
      } else {
        req.flash(
          'success',
          'registration proof successfully sent, please wait for the admin',
        );
        res.redirect(`/payment/history/${userId}#pendaftaran`);
      }
    } catch (error: any) {
      console.error('🔴 [Registration] Error:', error);
      req.flash('error', error.message || 'bukti pembayaran gagal dikirim ');
      res.redirect(`/payment/history/${userId}`);
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll() {
    return await this.pendaftaranService.findAll();
  }

  @Roles('super_admin')
  @Patch(':proses/:pendaftaranId')
  async update(
    @Param('pendaftaranId') pendaftaranId: number,
    @Param('proses') proses: string,
    @Body() updatePendaftaranDto: UpdateRegistrationsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const pendaftaran = await this.pendaftaranService.findOne(pendaftaranId);
      if (!pendaftaran) {
        return null;
      }
      if (proses === 'acc') {
        updatePendaftaranDto.file = pendaftaran['file'];
        updatePendaftaranDto.userId = pendaftaran['user']['id'];
        updatePendaftaranDto.courseId = pendaftaran['course']['id'];
        updatePendaftaranDto.process = 'acc';
        await this.pendaftaranService.update(
          pendaftaranId,
          updatePendaftaranDto,
        );
        try {
          await this.pendaftaranService.addUserToCourse(
            pendaftaran['user']['id'],
            pendaftaran['course']['id'],
          );
        } catch (error: any) {}

        req.flash('success', 'proces successfully change acc');
        res.redirect(
          `/program/detail/program/admin/${pendaftaran['course']['id']}`,
        );
      } else if (proses === 'rejected') {
        updatePendaftaranDto.file = pendaftaran['file'];
        updatePendaftaranDto.userId = pendaftaran['user']['id'];
        updatePendaftaranDto.courseId = pendaftaran['course']['id'];
        updatePendaftaranDto.process = 'rejected';
        await this.pendaftaranService.update(
          pendaftaranId,
          updatePendaftaranDto,
        );
        try {
          await this.pendaftaranService.removeCourseUser(
            pendaftaran['user']['id'],
            pendaftaran['course']['id'],
          );
        } catch (error: any) {}
        req.flash('success', 'proces successfully change rejected');
        res.redirect(
          `/program/detail/program/admin/${[pendaftaran]['course']['id']}`,
        );
      }
    } catch (error: any) {
      const pendaftaran = await this.pendaftaranService.findOne(pendaftaranId);
      req.flash('error', error.message || 'proses pembayaran gagal diubah');
      res.redirect(`/program/detail/program/admin/${pendaftaran['course']['id']}`);
    }
  }
}
