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
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';

@UseGuards(AuthenticatedGuard)
@Controller('mentor')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Roles('admin')
  @Post(':kelasId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'ttd', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 1000,
    minHeight: 300,
    maxHeight: 1000,
    maxSize: 3 * 1024 * 1024, // 3MB max
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/mentor',
  })
  async create(
    @Param('kelasId') kelasId: number,
    @Body() createMentorDto: CreateMentorDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createMentorDto.kelasId = kelasId;
      const uploadedImages = req.body.uploadedImageUrls || [];

      // uploadedImages akan berisi array dengan urutan: [profile, ttd]
      if (uploadedImages[0]) {
        createMentorDto.profile = uploadedImages[0];
      }
      if (uploadedImages[1]) {
        createMentorDto.ttd = uploadedImages[1];
      }

      await this.mentorService.create(createMentorDto);
      req.flash('success', 'mentor successfully created');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      console.log(error);
      req.flash('error', 'mentor failed to create');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:kelasId')
  async formCreate(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('admin/mentor/create', { user: req.user, kelasId });
  }

  @Roles('admin')
  @Get(':mentorId')
  async findOne(
    @Param('mentorId') mentorId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mentor = await this.mentorService.findOne(mentorId);
    res.render('admin/mentor/detail', { user: req.user, mentor });
  }

  @Roles('admin')
  @Get('formEdit/:mentorId')
  async formEdit(
    @Param('mentorId') mentorId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mentor = await this.mentorService.findOne(mentorId);
    res.render('admin/mentor/edit', { user: req.user, mentor });
  }

  @Roles('admin')
  @Patch(':kelasId/:mentorId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'ttd', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 1000,
    minHeight: 300,
    maxHeight: 1000,
    maxSize: 3 * 1024 * 1024, // 3MB max
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/mentor',
  })
  async update(
    @Param('mentorId') mentorId: number,
    @Param('kelasId') kelasId: number,
    @Body() updateMentorDto: UpdateMentorDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const mentor = await this.mentorService.findOne(mentorId);
      const uploadedImages = req.body.uploadedImageUrls || [];

      // uploadedImages akan berisi array dengan urutan: [profile, ttd]
      if (uploadedImages[0]) {
        updateMentorDto.profile = uploadedImages[0];
        if (mentor.profile) {
          await this.mentorService.getPublicIdFromUrl(mentor.profile);
        }
      }

      if (uploadedImages[1]) {
        updateMentorDto.ttd = uploadedImages[1];
        if (mentor.ttd) {
          await this.mentorService.getPublicIdFromUrl(mentor.ttd);
        }
      }

      await this.mentorService.update(mentorId, updateMentorDto);
      req.flash('success', 'mentor successfully update');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);

    } catch (error) {
      req.flash('error', 'mentor failed to update');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
      
      
    }
  }

  @Roles('admin')
  @Delete(':mentorId/:kelasId')
  async remove(
    @Param('mentorId') mentorId: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const mentor = await this.mentorService.findOne(mentorId);
      if (!mentor) {
        req.flash('error', 'mentor not found');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
        
      }
      await this.mentorService.getPublicIdFromUrl(mentor.profile);
      await this.mentorService.remove(mentorId);
      req.flash('success', 'mentor successfully deleted');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
      
    } catch (error) {
      req.flash('error', 'mentor failed to delete');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
      
    }
  }
}
