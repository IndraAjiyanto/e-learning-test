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

  @Roles('super_admin')
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
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024, // 3MB max
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

      // uploadedImages berisi array, tapi urutan tergantung pada yang diupload
      // Gunakan req.files untuk menentukan field mana
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.profile?.length) {
        createMentorDto.profile = uploadedImages[0]; // asumsikan urutan sesuai dengan files
      }
      if (files?.ttd?.length) {
        createMentorDto.ttd = uploadedImages[files.profile ? 1 : 0];
      }

      await this.mentorService.create(createMentorDto);
      req.flash('success', 'mentor successfully created');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      console.log(error);
      req.flash('error', error.message || 'mentor failed to create');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:kelasId')
  async formCreate(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const teknologi = await this.mentorService.findTeknologi();
    res.render('super_admin/mentor/create', {
      user: req.user,
      kelasId,
      teknologi,
    });
  }

  @Roles('super_admin')
  @Get(':mentorId')
  async findOne(
    @Param('mentorId') mentorId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mentor = await this.mentorService.findOne(mentorId);
    const teknologi = await this.mentorService.findTeknologi();
    res.render('super_admin/mentor/detail', {
      user: req.user,
      mentor,
      teknologi,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:mentorId')
  async formEdit(
    @Param('mentorId') mentorId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mentor = await this.mentorService.findOne(mentorId);
    const teknologi = await this.mentorService.findTeknologi();
    res.render('super_admin/mentor/edit', {
      user: req.user,
      mentor,
      teknologi,
    });
  }

  @Roles('super_admin')
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
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024, // 3MB max
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

      // uploadedImages berisi array, urutan sesuai dengan files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.profile?.length) {
        updateMentorDto.profile = uploadedImages[0];
        if (mentor.profile) {
          await this.mentorService.getPublicIdFromUrl(mentor.profile);
        }
      }

      if (files?.ttd?.length) {
        updateMentorDto.ttd = uploadedImages[files.profile ? 1 : 0];
        if (mentor.ttd) {
          await this.mentorService.getPublicIdFromUrl(mentor.ttd);
        }
      }

      await this.mentorService.update(mentorId, updateMentorDto);
      req.flash('success', 'mentor successfully update');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'mentor failed to update');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
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
      await this.mentorService.getPublicIdFromUrl(mentor.ttd);
      await this.mentorService.remove(mentorId);
      req.flash('success', 'mentor successfully deleted');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'mentor failed to delete');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }
}
