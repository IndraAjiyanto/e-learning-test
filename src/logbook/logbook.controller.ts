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
  UploadedFile,
  Res,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { Request, Response } from 'express';
import { Proses } from 'src/entities/logbook.entity';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('logbooks')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Roles('user', 'admin')
  @Post(':sessionId')
  @UseInterceptors(
    FileInterceptor('dokumentasi', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'logbook_user',
  })
  async create(
    @Param('sessionId') sessionId: number,
    @Body() createLogbookDto: CreateLogbookDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {

      
      // if (!req.body.uploadedImageUrls || !req.body.uploadedImageUrls[0]) {
      //   throw new Error('Image upload failed. Please try again.');
      // }

      createLogbookDto.documentation = req.body.uploadedImageUrls?.[0] ?? null;
      if (req.user?.role === 'user') {
        createLogbookDto.userId = req.user!.id;
        createLogbookDto.process = 'proces';
      } else if (req.user?.role === 'admin') {
        createLogbookDto.process = 'acc';
      }
      createLogbookDto.sessionId = sessionId;
      await this.logbookService.create(createLogbookDto);
      const session = await this.logbookService.findSession(sessionId);
      req.flash('success', 'Log book added successfully');
      if (req.user?.role === 'admin') {
        res.redirect(`/session/${sessionId}`);
      } else if (req.user?.role === 'user') {
        res.redirect(`/program/${session.weeks.course.id}`);
      }
    } catch (error: any) {
      const session = await this.logbookService.findSession(sessionId);
      const errorMessage = error.message || 'Failed to add log book';
      req.flash('error', errorMessage);
      if (req.user?.role === 'admin') {
        res.redirect(`/session/${sessionId}`);
      } else if (req.user?.role === 'user') {
        res.redirect(`/program/${session.weeks.course.id}`);
      }
    }
  }

  @Roles('user')
  @Get('user/:courseId')
  async findLogBook(
    @Req() req: Request,
    @Res() res: Response,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const logbooks = await this.logbookService.findLogBook(
      req.user!.id,
      courseId,
    );
    res.render('user/logbooks/index', { user: req.user, logbooks, logbook: logbooks, courseId });
  }

  @Roles('user')
  @Get('formCreate/:sessionId/:courseId')
  async createLogbook(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('user/logbooks/createLog', {
      user: req.user,
      sessionId,
      courseId,
    });
  }

  @Roles('user', 'admin')
  @Get('formEdit/:logbookId')
  async formEdit(
    @Param('logbookId') logbookId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const logbooks = await this.logbookService.findOne(logbookId);
    if (req.user!.role === 'admin') {
      res.render('admin/logbooks/edit', { user: req.user, logbook: logbooks });
    } else {
      res.render('user/logbooks/edit', { user: req.user, logbook: logbooks });
    }
  }

  @Roles('user', 'admin')
  @Get(':logbookId')
  async findOne(
    @Param('logbookId') logbookId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const logbooks = await this.logbookService.findOne(logbookId);
    res.render('user/logbooks/detail', { user: req.user, logbook: logbooks });
  }

  @Roles('admin')
  @Get('create/:sessionId')
  async createLogbookUser(
    @Param('sessionId') sessionId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const users = await this.logbookService.findUsers(sessionId);
    res.render('admin/logbooks/create', { user: req.user, sessionId, users });
  }

  @Roles('admin', 'user')
  @Patch(':logbookId')
  @UseInterceptors(
    FileInterceptor('dokumentasi', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'logbook_user',
  })
  async update(
    @UploadedFile() dokumentasi: Express.Multer.File,
    @Param('logbookId') logbookId: number,
    @Body() updateLogbookDto: UpdateLogbookDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const logbooks = await this.logbookService.findOne(logbookId);
      if (dokumentasi && dokumentasi.size > 0) {
        if (logbooks.dokumentasi) {
        await this.logbookService.deleteFile(logbooks.dokumentasi);
      }
        updateLogbookDto.documentation =
          req.body.uploadedImageUrls?.[0] || dokumentasi.path;
      }
      updateLogbookDto.process = 'proces';
      await this.logbookService.update(logbookId, updateLogbookDto);
      req.flash('success', 'logbooks successfully updated');
      if (req.user?.role === 'admin') {
        res.redirect(`/session/${logbooks.session.id}`);
      } else if (req.user?.role === 'user') {
        res.redirect(`/program/${logbooks.session.weeks.course.id}`);
      }
    } catch (error: any) {

      console.log('====== ERROR UPDATE LOGBOOK ======');
      console.error(error.response || error.message || error);


      const logbooks = await this.logbookService.findOne(logbookId);
      req.flash('error', error.message || 'logbooks failed to update');
      if (req.user?.role === 'admin') {
        res.redirect(`/session/${logbooks.session.id}`);
      } else if (req.user?.role === 'user') {
        res.redirect(`/program/${logbooks.session.weeks.course.id}`);
      }
    }
  }

  @Roles('admin')
  @Patch(':logbookId/:proses')
  async updateProses(
    @Body() updateLogbookDto: UpdateLogbookDto,
    @Param('logbookId') logbookId: number,
    @Param('proses') proses: Proses,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const logbooks = await this.logbookService.findOne(logbookId);
      updateLogbookDto.process = proses;
      await this.logbookService.update(logbookId, updateLogbookDto);
      req.flash('success', 'logbooks successfully update proses');
      res.redirect(`/session/${logbooks.session.id}`);
    } catch (error: any) {
      const logbooks = await this.logbookService.findOne(logbookId);
      req.flash('error', error.message || 'logbooks failed to update proses');
      res.redirect(`/session/${logbooks.session.id}`);
    }
  }

  @Roles('admin')
  @Delete(':sessionId/:logbookId')
  async remove(
    @Param('logbookId') logbookId: number,
    @Param('sessionId') sessionId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const logbooks = await this.logbookService.findOne(logbookId);
      if (logbooks && logbooks.dokumentasi) {
        await this.logbookService.deleteFile(logbooks.dokumentasi);
      }
      await this.logbookService.remove(logbookId);
      req.flash('success', 'logbooks successfully deleted');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'logbooks failed to delete');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
