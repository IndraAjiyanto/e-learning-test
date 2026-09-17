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
import { ProcessStatus } from 'src/entities/types/process-status';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { flashToast, flashToastError } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Controller('logbooks')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Roles('user', 'admin')
  @Post(':sessionId')
  @UseInterceptors(
    FileInterceptor('documentation', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'logbook_user',
  })
  async create(
    @Param('sessionId') sessionId: string,
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
        createLogbookDto.userId = req.user.id;
        createLogbookDto.process = 'process';
      } else if (req.user?.role === 'admin') {
        createLogbookDto.process = 'approved';
      }
      createLogbookDto.sessionId = sessionId;
      await this.logbookService.create(createLogbookDto);
      const session = await this.logbookService.findSession(sessionId);
      if (req.user?.role === 'admin') {
        flashToast(
          req,
          'Logbook Created',
          'The new logbook entry has been added to this session.',
        );
        res.redirect(`/session/${sessionId}`);
      } else if (req.user?.role === 'user') {
        flashToast(
          req,
          'Logbook Created',
          'Your logbook has been submitted and is under review.',
        );
        // res.redirect(
        //   `/program/myProgram/${req.user.id}?courseId=${session.weeks.course.id}`,
        // );
        res.redirect(`/program/${session.weeks.course.id}`);
      }
    } catch (error: any) {
      const session = await this.logbookService.findSession(sessionId);
      const errorMessage = error.message || 'Failed to add log book';
      flashToastError(
        req,
        'Logbook not saved',
        errorMessage,
      );
      if (req.user?.role === 'admin') {
        res.redirect(`/session/${sessionId}`);
      } else if (req.user?.role === 'user') {
        res.redirect(
          `/program/myProgram/${req.user.id}?courseId=${session.weeks.course.id}`,
        );
      }
    }
  }

  @Roles('user')
  @Get('user/:courseId')
  async findLogBook(
    @Req() req: Request,
    @Res() res: Response,
    @Param('courseId') courseId: string,
  ) {
    const logbooks = await this.logbookService.findLogBook(
      req.user!.id,
      courseId,
    );
    res.render('user/logbooks/index', {
      user: req.user,
      logbooks,
      logbook: logbooks,
      courseId,
      bareShell: true,
    });
  }

  @Roles('user')
  @Get('formCreate/:sessionId/:courseId')
  async createLogbook(
    @Param('sessionId') sessionId: string,
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('user/logbooks/createLog', {
      user: req.user,
      sessionId,
      courseId,
      bareShell: true,
    });
  }

  @Roles('user', 'admin')
  @Get('formEdit/:logbookId')
  async formEdit(
    @Param('logbookId') logbookId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const logbooks = await this.logbookService.findOne(logbookId);
    if (req.user!.role === 'admin') {
      res.render('admin/logbooks/edit', { user: req.user, logbook: logbooks });
    } else {
      res.render('user/logbooks/edit', {
        user: req.user,
        logbook: logbooks,
        bareShell: true,
      });
    }
  }

  @Roles('user', 'admin')
  @Get(':logbookId')
  async findOne(
    @Param('logbookId') logbookId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const logbooks = await this.logbookService.findOne(logbookId);
    res.render('user/logbooks/detail', {
      user: req.user,
      logbook: logbooks,
      bareShell: true,
    });
  }

  @Roles('admin')
  @Get('create/:sessionId')
  async createLogbookUser(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const users = await this.logbookService.findUsers(sessionId);
    res.render('admin/logbooks/create', { user: req.user, sessionId, users });
  }

  @Roles('admin', 'user')
  @Patch(':logbookId')
  @UseInterceptors(
    FileInterceptor('documentation', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'logbook_user',
  })
  async update(
    @UploadedFile() documentation: Express.Multer.File,
    @Param('logbookId') logbookId: string,
    @Body() updateLogbookDto: UpdateLogbookDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const logbooks = await this.logbookService.findOne(logbookId);
      if (documentation && documentation.size > 0) {
        if (logbooks.documentation) {
          await this.logbookService.deleteFile(logbooks.documentation);
        }
        updateLogbookDto.documentation =
          req.body.uploadedImageUrls?.[0] || documentation.path;
      }
      updateLogbookDto.process = 'process';
      await this.logbookService.update(logbookId, updateLogbookDto);
      flashToast(req, 'Changes Saved', 'The logbook has been updated.');
      if (req.user?.role === 'admin') {
        res.redirect(`/session/${logbooks.session.id}`);
      } else if (req.user?.role === 'user') {
        res.redirect(
          `/program/myProgram/${req.user.id}?courseId=${logbooks.session.weeks.course.id}`,
        );
      }
    } catch (error: any) {
      console.log('====== ERROR UPDATE LOGBOOK ======');
      console.error(error.response || error.message || error);

      const logbooks = await this.logbookService.findOne(logbookId);
      flashToastError(
        req,
        'Logbook not saved',
        error.message || 'Please try again in a moment.',
      );
      if (req.user?.role === 'admin') {
        res.redirect(`/session/${logbooks.session.id}`);
      } else if (req.user?.role === 'user') {
        res.redirect(
          `/program/myProgram/${req.user.id}?courseId=${logbooks.session.weeks.course.id}`,
        );
      }
    }
  }

  @Roles('admin')
  @Patch(':logbookId/:proses')
  async updateProses(
    @Body() updateLogbookDto: UpdateLogbookDto,
    @Param('logbookId') logbookId: string,
    @Param('proses') proses: ProcessStatus,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const logbooks = await this.logbookService.findOne(logbookId);
      updateLogbookDto.process = proses;
      await this.logbookService.update(logbookId, updateLogbookDto);
      flashToast(req, 'Status Updated', 'The logbook status has been updated.');
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
    @Param('logbookId') logbookId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const logbooks = await this.logbookService.findOne(logbookId);
      if (logbooks && logbooks.documentation) {
        await this.logbookService.deleteFile(logbooks.documentation);
      }
      await this.logbookService.remove(logbookId);
      flashToast(
        req,
        'Logbook Deleted',
        'The logbook has been permanently removed.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'logbooks failed to delete');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
