import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Res,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { LogbookMentorService } from './logbook_mentor.service';
import { CreateLogbookMentorDto } from './dto/create-logbook_mentor.dto';
import { UpdateLogbookMentorDto } from './dto/update-logbook_mentor.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemory, multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('logbook-mentor')
export class LogbookMentorController {
  constructor(private readonly logbookMentorService: LogbookMentorService) {}

  @Roles('admin')
  @Post(':pertemuanId')
  @UseInterceptors(
    FileInterceptor('dokumentasi', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    folder: 'logbook_mentor',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async create(
    @Param('pertemuanId') pertemuanId: number,
    @Body() createLogbookMentorDto: CreateLogbookMentorDto,
    @Res() res: Response,
    @Req() req: Request,
    @UploadedFile() dokumentasi: Express.Multer.File,
  ) {
    try {
      createLogbookMentorDto.dokumentasi = req.body.uploadedImageUrls?.[0];
      createLogbookMentorDto.userId = req.user!.id;
      createLogbookMentorDto.pertemuanId = pertemuanId;
      await this.logbookMentorService.create(createLogbookMentorDto);
      req.flash('success', 'Log book added successfully');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', error.message || 'Log book failed to create');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }


  @Roles('admin')
  @Get(':logbook_mentorId')
  async findOne(
    @Param('logbook_mentorId') logbook_mentorId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const logbook_mentor =
      await this.logbookMentorService.findOne(logbook_mentorId);
    res.render('admin/logbook_mentor/detail', {
      user: req.user,
      logbook_mentor,
    });
  }

  @Roles('admin')
  @Get('formCreate/:pertemuanId')
  async formCreate(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('admin/logbook_mentor/create', { user: req.user, pertemuanId });
  }

  @Roles('admin')
  @Get('formEdit/:logbook_mentorId')
  async formEdit(
    @Param('logbook_mentorId') logbook_mentorId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const logbook_mentor =
      await this.logbookMentorService.findOne(logbook_mentorId);
    res.render('admin/logbook_mentor/edit', { user: req.user, logbook_mentor });
  }

  @Roles('admin')
  @Patch(':logbook_mentorId')
  @UseInterceptors(
    FileInterceptor('dokumentasi', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    folder: 'logbook_mentor',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async update(
    @Param('logbook_mentorId') logbook_mentorId: number,
    @UploadedFile() dokumentasi: Express.Multer.File,
    @Body() updateLogbookMentorDto: UpdateLogbookMentorDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const logbook = await this.logbookMentorService.findOne(logbook_mentorId);
      if (dokumentasi) {
        await this.logbookMentorService.deleteFile(logbook.dokumentasi);
        updateLogbookMentorDto.dokumentasi = req.body.uploadedImageUrls?.[0];
      }
      await this.logbookMentorService.update(
        logbook_mentorId,
        updateLogbookMentorDto,
      );
      req.flash('success', 'logbook successfully updated');
      res.redirect(`/pertemuans/${logbook.pertemuan.id}`);
    } catch (error) {
      const logbook = await this.logbookMentorService.findOne(logbook_mentorId);
      req.flash('error', error.message || 'logbook failed to updated');
      res.redirect(`/pertemuans/${logbook.pertemuan.id}`);
    }
  }

  @Roles('admin')
  @Delete(':pertemuanId/:logbook_mentorId')
  async remove(
    @Param('logbook_mentorId') logbook_mentorId: number,
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const logbook = await this.logbookMentorService.findOne(logbook_mentorId);
      await this.logbookMentorService.deleteFile(logbook.dokumentasi);
      await this.logbookMentorService.remove(logbook_mentorId);
      req.flash('success', 'logbook successfully deleted');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', error.message || 'logbook failed to delete');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }
}
