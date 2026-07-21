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
import { MentorLogbookService } from './mentor_logbook.service';
import { CreateMentorLogbookDto } from './dto/create-mentor_logbook.dto';
import { UpdateMentorLogbookDto } from './dto/update-mentor_logbook.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('logbooks-mentor')
export class MentorLogbookController {
  constructor(private readonly logbookMentorService: MentorLogbookService) {}

  @Roles('admin')
  @Post(':sessionId')
  @UseInterceptors(
    FileInterceptor('documentation', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    folder: 'mentor_logbook',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async create(
    @Param('sessionId') sessionId: number,
    @Body() createMentorLogbookDto: CreateMentorLogbookDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createMentorLogbookDto.documentation = req.body.uploadedImageUrls?.[0];
      createMentorLogbookDto.userId = req.user!.id;
      createMentorLogbookDto.sessionId = sessionId;
      await this.logbookMentorService.create(createMentorLogbookDto);
      req.flash('success', 'Log book added successfully');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Log book failed to create');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Get(':mentor_logbookId')
  async findOne(
    @Param('mentor_logbookId') mentor_logbookId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mentor_logbook =
      await this.logbookMentorService.findOne(mentor_logbookId);
    res.render('admin/mentor_logbook/detail', {
      user: req.user,
      mentor_logbook,
    });
  }

  @Roles('admin')
  @Get('formCreate/:sessionId')
  async formCreate(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('admin/mentor_logbook/create', { user: req.user, sessionId });
  }

  @Roles('admin')
  @Get('formEdit/:mentor_logbookId')
  async formEdit(
    @Param('mentor_logbookId') mentor_logbookId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mentor_logbook =
      await this.logbookMentorService.findOne(mentor_logbookId);
    res.render('admin/mentor_logbook/edit', { user: req.user, mentor_logbook });
  }

  @Roles('admin')
  @Patch(':mentor_logbookId')
  @UseInterceptors(
    FileInterceptor('documentation', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    folder: 'mentor_logbook',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async update(
    @Param('mentor_logbookId') mentor_logbookId: number,
    @UploadedFile() documentation: Express.Multer.File,
    @Body() updateMentorLogbookDto: UpdateMentorLogbookDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const logbooks = await this.logbookMentorService.findOne(mentor_logbookId);
      if (documentation) {
        await this.logbookMentorService.deleteFile(logbooks.documentation);
        updateMentorLogbookDto.documentation = req.body.uploadedImageUrls?.[0];
      }
      await this.logbookMentorService.update(
        mentor_logbookId,
        updateMentorLogbookDto,
      );
      req.flash('success', 'logbooks successfully updated');
      res.redirect(`/session/${logbooks.session.id}`);
    } catch (error: any) {
      const logbooks = await this.logbookMentorService.findOne(mentor_logbookId);
      req.flash('error', error.message || 'logbooks failed to updated');
      res.redirect(`/session/${logbooks.session.id}`);
    }
  }

  @Roles('admin')
  @Delete(':sessionId/:mentor_logbookId')
  async remove(
    @Param('mentor_logbookId') mentor_logbookId: number,
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const logbooks = await this.logbookMentorService.findOne(mentor_logbookId);
      await this.logbookMentorService.deleteFile(logbooks.documentation);
      await this.logbookMentorService.remove(mentor_logbookId);
      req.flash('success', 'logbooks successfully deleted');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'logbooks failed to delete');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
