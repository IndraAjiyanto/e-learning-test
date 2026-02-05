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
import { Proses } from 'src/entities/logbook.entity';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('logbook')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Roles('user','admin')
  @Post(':pertemuanId')
  @UseInterceptors(
    FileInterceptor('dokumentasi',multerConfigMemoryOnly ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'logbook_user',
  })
  async create(
    @Param('pertemuanId') pertemuanId: number,
    @Body() createLogbookDto: CreateLogbookDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      if (!req.body.uploadedImageUrls || !req.body.uploadedImageUrls[0]) {
        throw new Error('Image upload failed. Please try again.');
      }

      createLogbookDto.dokumentasi = req.body.uploadedImageUrls[0];
      if (req.user?.role === 'user') {
      createLogbookDto.userId = req.user!.id;
        createLogbookDto.proses = 'proces';
      } else if (req.user?.role === 'admin') {
        createLogbookDto.proses = 'acc';
      }
      createLogbookDto.pertemuanId = pertemuanId;
      await this.logbookService.create(createLogbookDto);
      const pertemuan = await this.logbookService.findPertemuan(pertemuanId);
      req.flash('success', 'Log book added successfully');
      if (req.user?.role === 'admin') {
        res.redirect(`/pertemuans/${pertemuanId}`);
      } else if (req.user?.role === 'user') {
        res.redirect(`/kelass/${pertemuan.minggu.kelas.id}`);
      }
    } catch (error) {
      const pertemuan = await this.logbookService.findPertemuan(pertemuanId);
      const errorMessage = error.message || 'Failed to add log book';
      req.flash('error', errorMessage);
      if (req.user?.role === 'admin') {
                res.redirect(`/pertemuans/${pertemuanId}`);
      } else if (req.user?.role === 'user') {
        res.redirect(`/kelass/${pertemuan.minggu.kelas.id}`);
      }
    }
  }

  @Roles('user')
  @Get('user/:kelasId')
  async findLogBook(@Req() req: Request, @Res() res: Response, @Param('kelasId') kelasId: number) {
      const logbook = await this.logbookService.findLogBook(req.user!.id, kelasId);
      res.render('user/logbook/index', { user: req.user, logbook, kelasId });
  }

  @Roles('user')
  @Get('formCreate/:pertemuanId/:kelasId')
  async createLogbook(
    @Param('pertemuanId') pertemuanId: number,
    @Param('kelasId') kelasId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('user/logbook/createLog', {
      user: req.user,
      pertemuanId,
      kelasId,
    });
  }

  @Roles('user', 'admin')
  @Get('formEdit/:logbookId')
  async formEdit(
    @Param('logbookId') logbookId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const logbook = await this.logbookService.findOne(logbookId);
    if (req.user!.role === 'admin') {
      res.render('admin/logbook/edit', { user: req.user, logbook });
    } else {
      res.render('user/logbook/edit', { user: req.user, logbook });
    }
  }

  @Roles('user', 'admin')
  @Get(':logbookId')
  async findOne(
    @Param('logbookId') logbookId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const logbook = await this.logbookService.findOne(logbookId);
    res.render('user/logbook/detail', { user: req.user, logbook });
  }

  @Roles('admin')
  @Get('create/:pertemuanId')
  async createLogbookUser(
    @Param('pertemuanId') pertemuanId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const users = await this.logbookService.findUsers(pertemuanId);
    res.render('admin/logbook/create', { user: req.user, pertemuanId, users });
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
      const logbook = await this.logbookService.findOne(logbookId);
      if (dokumentasi) {
        await this.logbookService.deleteFile(logbook.dokumentasi);
        updateLogbookDto.dokumentasi =
          req.body.uploadedImageUrls?.[0] || dokumentasi.path;
      }
      updateLogbookDto.proses = 'proces';
      await this.logbookService.update(logbookId, updateLogbookDto);
      req.flash('success', 'logbook successfully updated');
      if (req.user?.role === 'admin') {
        res.redirect(`/pertemuans/${logbook.pertemuan.id}`);
      } else if (req.user?.role === 'user') {
        res.redirect(`/kelass/${logbook.pertemuan.minggu.kelas.id}`);
      }
    } catch (error) {
      const logbook = await this.logbookService.findOne(logbookId);
      req.flash('error', error.message || 'logbook failed to update');
      if (req.user?.role === 'admin') {
        res.redirect(`/pertemuans/${logbook.pertemuan.id}`);
      } else if (req.user?.role === 'user') {
        res.redirect(`/kelass/${logbook.pertemuan.minggu.kelas.id}`);
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
      const logbook = await this.logbookService.findOne(logbookId);
      updateLogbookDto.proses = proses;
      await this.logbookService.update(logbookId, updateLogbookDto);
      req.flash('success', 'logbook successfully update proses');
      res.redirect(`/pertemuans/${logbook.pertemuan.id}`);
    } catch (error) {
      const logbook = await this.logbookService.findOne(logbookId);
      req.flash('error', error.message || 'logbook failed to update proses');
      res.redirect(`/pertemuans/${logbook.pertemuan.id}`);
    }
  }

  @Roles('admin')
  @Delete(':pertemuanId/:logbookId')
  async remove(
    @Param('logbookId') logbookId: number,
    @Param('pertemuanId') pertemuanId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const logbook = await this.logbookService.findOne(logbookId);
      await this.logbookService.deleteFile(logbook.dokumentasi);
      await this.logbookService.remove(logbookId);
      req.flash('success', 'logbook successfully deleted');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', error.message || 'logbook failed to delete');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }
}
