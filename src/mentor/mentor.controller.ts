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
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('mentor')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Roles('super_admin', 'admin')
  @Post(':courseId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'profile', maxCount: 1 }],
      multerConfigMemoryOnly,
    ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'mentor',
  })
  async create(
    @Param('courseId') courseId: number,
    @Body() createMentorDto: CreateMentorDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createMentorDto.courseId = courseId;
      const uploadedImages = req.body.uploadedImageUrls || [];

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.profile?.length) {
        createMentorDto.profile = uploadedImages[0];
      }

      await this.mentorService.create(createMentorDto);
      req.flash('success', 'mentor successfully created');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'mentor failed to create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin', 'admin')
  @Get('formCreate/:courseId')
  async formCreate(
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const technologies = await this.mentorService.findTechnologies();
    res.render('super_admin/mentor/create', {
      user: req.user,
      courseId,
      technologies,
    });
  }

  @Roles('super_admin', 'admin')
  @Get(':mentorId')
  async findOne(
    @Param('mentorId') mentorId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mentor = await this.mentorService.findOne(mentorId);
    const technologies = await this.mentorService.findTechnologies();
    res.render('super_admin/mentor/detail', {
      user: req.user,
      mentor,
      technologies,
    });
  }

  @Roles('super_admin', 'admin')
  @Get('formEdit/:mentorId')
  async formEdit(
    @Param('mentorId') mentorId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mentor = await this.mentorService.findOne(mentorId);
    const technologies = await this.mentorService.findTechnologies();
    res.render('super_admin/mentor/edit', {
      user: req.user,
      mentor,
      technologies,
    });
  }

  @Roles('super_admin', 'admin')
  @Patch(':courseId/:mentorId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'profile', maxCount: 1 }],
      multerConfigMemoryOnly,
    ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'mentor',
  })
  async update(
    @Param('mentorId') mentorId: number,
    @Param('courseId') courseId: number,
    @Body() updateMentorDto: UpdateMentorDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const mentor = await this.mentorService.findOne(mentorId);
      const uploadedImages = req.body.uploadedImageUrls || [];

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.profile?.length) {
        updateMentorDto.profile = uploadedImages[0];
        if (mentor.profile) {
          await this.mentorService.deleteFile(mentor.profile);
        }
      }

      await this.mentorService.update(mentorId, updateMentorDto);
      req.flash('success', 'mentor successfully update');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'mentor failed to update');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin', 'admin')
  @Delete(':mentorId/:courseId')
  async remove(
    @Param('mentorId') mentorId: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const mentor = await this.mentorService.findOne(mentorId);
      if (!mentor) {
        req.flash('error', 'mentor not found');
        res.redirect(`/program/detail/program/admin/${courseId}`);
      }
      await this.mentorService.deleteFile(mentor.profile);
      await this.mentorService.remove(mentorId);
      req.flash('success', 'mentor successfully deleted');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'mentor failed to delete');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
