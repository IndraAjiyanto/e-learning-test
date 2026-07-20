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
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('logbooks-mentor')
export class LogbookMentorController {
  constructor(private readonly logbookMentorService: LogbookMentorService) {}

  @Roles('admin')
  @Post(':sessionId')
  @UseInterceptors(
    FileInterceptor('documentation', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    folder: 'logbook_mentor',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async create(
    @Param('sessionId') sessionId: number,
    @Body() createLogbookMentorDto: CreateLogbookMentorDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createLogbookMentorDto.documentation = req.body.uploadedImageUrls?.[0];
      createLogbookMentorDto.userId = req.user!.id;
      createLogbookMentorDto.sessionId = sessionId;
      await this.logbookMentorService.create(createLogbookMentorDto);
      req.flash('success', 'Log book added successfully');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Log book failed to create');
      res.redirect(`/session/${sessionId}`);
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
  @Get('formCreate/:sessionId')
  async formCreate(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('admin/logbook_mentor/create', { user: req.user, sessionId });
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
    FileInterceptor('documentation', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    folder: 'logbook_mentor',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async update(
    @Param('logbook_mentorId') logbook_mentorId: number,
    @UploadedFile() documentation: Express.Multer.File,
    @Body() updateLogbookMentorDto: UpdateLogbookMentorDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const logbooks = await this.logbookMentorService.findOne(logbook_mentorId);
      if (documentation) {
        await this.logbookMentorService.deleteFile(logbooks.documentation);
        updateLogbookMentorDto.documentation = req.body.uploadedImageUrls?.[0];
      }
      await this.logbookMentorService.update(
        logbook_mentorId,
        updateLogbookMentorDto,
      );
      req.flash('success', 'logbooks successfully updated');
      res.redirect(`/session/${logbooks.session.id}`);
    } catch (error: any) {
      const logbooks = await this.logbookMentorService.findOne(logbook_mentorId);
      req.flash('error', error.message || 'logbooks failed to updated');
      res.redirect(`/session/${logbooks.session.id}`);
    }
  }

  @Roles('admin')
  @Delete(':sessionId/:logbook_mentorId')
  async remove(
    @Param('logbook_mentorId') logbook_mentorId: number,
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const logbooks = await this.logbookMentorService.findOne(logbook_mentorId);
      await this.logbookMentorService.deleteFile(logbooks.documentation);
      await this.logbookMentorService.remove(logbook_mentorId);
      req.flash('success', 'logbooks successfully deleted');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'logbooks failed to delete');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
