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
import { multerConfigImage } from 'src/common/config/multer.config';
import { Request, Response } from 'express';
import { Proses } from 'src/entities/logbook.entity';
import {
  Paginate,
  PaginationParams,
} from 'src/common/decorators/pagination.decorator';

@UseGuards(AuthenticatedGuard)
@Controller('logbook')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Roles('user')
  @Post(':pertemuanId')
  @UseInterceptors(FileInterceptor('dokumentasi', multerConfigImage))
  async create(
    @Param('pertemuanId') pertemuanId: number,
    @Body() createLogbookDto: CreateLogbookDto,
    @UploadedFile() dokumentasi: Express.Multer.File,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createLogbookDto.dokumentasi = dokumentasi.path;
      createLogbookDto.userId = req.user!.id;
      if (req.user?.role === 'user') {
        createLogbookDto.proses = 'proces';
      } else if (req.user?.role === 'admin') {
        createLogbookDto.proses = 'acc';
      }
      createLogbookDto.pertemuanId = pertemuanId;
      await this.logbookService.create(createLogbookDto);
      const pertemuan = await this.logbookService.findPertemuan(pertemuanId);
      req.flash('success', 'Log book added successfully');
      if (req.user?.role === 'admin') {
        res.redirect('/logbook');
      } else if (req.user?.role === 'user') {
        res.redirect(`/kelass/${pertemuan.minggu.kelas.id}`);
      }
    } catch (error) {
      const pertemuan = await this.logbookService.findPertemuan(pertemuanId);
      req.flash('error', 'Failed to add log book');
      if (req.user?.role === 'admin') {
        res.redirect('/logbook');
      } else if (req.user?.role === 'user') {
        res.redirect(`/kelass/${pertemuan.minggu.kelas.id}`);
      }
    }
  }

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('dokumentasi', multerConfigImage))
  async createLogBook(
    @Body() createLogbookDto: CreateLogbookDto,
    @UploadedFile() dokumentasi: Express.Multer.File,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createLogbookDto.dokumentasi = dokumentasi.path;
      createLogbookDto.userId = req.user!.id;
      await this.logbookService.create(createLogbookDto);
      req.flash('success', 'Log book added successfully');
      res.redirect('/logbook');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to add log book');
      res.redirect('/logbook');
    }
  }

  @Roles('super_admin')
  @Get('all')
  async findAll(@Req() req: Request, @Res() res: Response) {
    const logbook = await this.logbookService.findAll();
    const logbook_mentor = await this.logbookService.findLogBookMentor();
    res.render('super_admin/logbook/index', {
      user: req.user,
      logbook,
      logbook_mentor,
    });
  }

  @Roles('user', 'admin')
  @Get()
  async findLogBook(@Req() req: Request, @Res() res: Response) {
    if (req.user!.role === 'admin') {
      const kelas = await this.logbookService.findAllKelas();
      res.render('admin/logbook/index', { user: req.user, kelas });
    } else if (req.user!.role === 'user') {
      const kelas = await this.logbookService.findKelasByUser(req.user!.id);
      res.render('user/logbook/index', { user: req.user, kelas });
    }
  }

  @Roles('user', 'admin')
  @Get('data')
  async logbookData(
    @Paginate({ defaultLimit: 10 }) pagination: PaginationParams,
    @Req() req: Request,
  ) {
    console.log('📊 Logbook data endpoint hit!', {
      role: req.user?.role,
      userId: req.user?.id,
      pagination,
    });

    if (req.user!.role === 'admin') {
      const result = await this.logbookService.paginateLogbook(pagination);
      console.log('📦 Admin result:', {
        total: result.total,
        itemsCount: result.items.length,
      });
      return result;
    } else if (req.user!.role === 'user') {
      const result = await this.logbookService.paginateLogbook(
        pagination,
        req.user!.id,
      );
      console.log('📦 User result:', {
        total: result.total,
        itemsCount: result.items.length,
      });
      return result;
    }
  }

  @Roles('user', 'admin')
  @Get('export')
  async exportLogbook(@Req() req: Request, @Res() res: Response) {
    try {
      const { kelas, dateFrom, dateTo, search } = req.query;

      const filters = {
        kelas: kelas as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        search: search as string,
      };

      let logbooks;
      if (req.user!.role === 'admin') {
        logbooks = await this.logbookService.findAllFiltered(filters);
      } else {
        logbooks = await this.logbookService.findAllFiltered(
          filters,
          req.user!.id,
        );
      }
      const excelBuffer = await this.logbookService.generateExcel(logbooks);

      const date = new Date();
      const filename = `Logbook_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.send(excelBuffer);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  }

  @Roles('user')
  @Get('formCreate')
  async formCreate(@Req() req: Request, @Res() res: Response) {
    const kelas = await this.logbookService.findKelasByUser(req.user!.id);
    res.render('user/logbook/create', { user: req.user, kelas });
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
    res.render('user/logbook/edit', { user: req.user, logbook });
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

  @Roles('admin', 'user')
  @Patch(':logbookId')
  @UseInterceptors(FileInterceptor('dokumentasi', multerConfigImage))
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
        await this.logbookService.getPublicIdFromUrl(logbook.dokumentasi);
        updateLogbookDto.dokumentasi = dokumentasi.path;
      }
      updateLogbookDto.proses = 'proces';
      await this.logbookService.update(logbookId, updateLogbookDto);
      req.flash('success', 'logbook successfully updated');
      if (req.user?.role === 'admin') {
        res.redirect('/logbook');
      } else if (req.user?.role === 'user') {
        res.redirect(`/kelass/${logbook.pertemuan.minggu.kelas.id}`);
      }
    } catch (error) {
      const logbook = await this.logbookService.findOne(logbookId);
      req.flash('error', 'logbook failed to update');
      if (req.user?.role === 'admin') {
        res.redirect('/logbook');
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
      req.flash('error', 'logbook failed to update proses');
      res.redirect(`/pertemuans/${logbook.pertemuan.id}`);
    }
  }

  @Roles('user', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logbookService.remove(+id);
  }
}
