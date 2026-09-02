import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
  Req,
  UseFilters,
} from '@nestjs/common';
import { MaterisService } from './materis.service';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { JenisFile } from 'src/entities/materi.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Request, Response } from 'express';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { ValidateFileInterceptor } from 'src/common/interceptors/validate-file.interceptor';
import { ValidateFile } from 'src/common/decorators/validate-file.decorator';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('learning-material')
export class MaterisController {
  constructor(private readonly materisService: MaterisService) {}

  @Roles('admin')
  @Post('pdf/:pertemuanId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'materi/pdf',
    resourceType: 'raw',
  })
  async createPdf(
    @Body() createMaterisDto: CreateMaterisDto,
    @Res() res: Response,
    @Param('pertemuanId') pertemuanId: number,
    @Req() req: Request,
  ) {
    try {
      createMaterisDto.file = req.body.uploadedFileUrls?.[0];
      createMaterisDto.pertemuanId = pertemuanId;
      createMaterisDto.jenis_file = 'pdf';
      await this.materisService.create(createMaterisDto);
      req.flash('success', 'Successfully created PDF material');
      res.redirect(`/session/${pertemuanId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create PDF material');
      res.redirect(`/session/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Post('ppt/:pertemuanId')
  async createPpt(
    @Body() createMaterisDto: CreateMaterisDto,
    @Res() res: Response,
    @Param('pertemuanId') pertemuanId: number,
    @Req() req: Request,
  ) {
    try {
      createMaterisDto.pertemuanId = pertemuanId;
      createMaterisDto.jenis_file = 'ppt';

      await this.materisService.create(createMaterisDto);
      req.flash('success', 'Successfully created PPT material');
      res.redirect(`/session/${pertemuanId}`);
    } catch (error: any) {
      console.error('Error creating PPT material:', error);
      req.flash('error', error.message || 'Failed to create PPT material');
      res.redirect(`/session/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Post('video/:pertemuanId')
  async createVideo(
    @Body() createMaterisDto: CreateMaterisDto,
    @Res() res: Response,
    @Param('pertemuanId') pertemuanId: number,
    @Req() req: Request,
  ) {
    try {
      createMaterisDto.pertemuanId = pertemuanId;
      createMaterisDto.jenis_file = 'video';
      await this.materisService.create(createMaterisDto);
      req.flash('success', 'Successfully created video material');
      res.redirect(`/session/${pertemuanId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create video material');
      res.redirect(`/session/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:id')
  async formCreate(
    @Param('id') id: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const materipdf = await this.materisService.findMateriPdf(id);
    const materivideo = await this.materisService.findMateriVideo(id);
    const materippt = await this.materisService.findMateriPpt(id);
    res.render('admin/materi/index', {
      user: req.user,
      id,
      materipdf,
      materippt,
      materivideo,
    });
  }

  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.materisService.findOne(id);
  }

  // @Roles('admin', 'user')
  // @Get('/kelas/:pertemuanId')
  // findMateriByKelas(@Param('pertemuanId') pertemuanId: number) {
  //   return this.materisService.findMateriBypertemuan(pertemuanId);
  // }

  @Roles('admin', 'user')
  @Get(':jenis_file/:pertemuanId')
  async findMateriByJenisFile(
    @Param('jenis_file') jenis_file: JenisFile,
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const pertemuan = await this.materisService.findPertemuan(pertemuanId);
    if (jenis_file === 'video') {
      const materi = await this.materisService.findMateriVideo(pertemuanId);
      res.render('materi/video', { user: req.user, materi, pertemuan });
    } else if (jenis_file === 'pdf') {
      const materi = await this.materisService.findMateriPdf(pertemuanId);
      res.render('materi/pdf', { user: req.user, materi, pertemuan });
    } else if (jenis_file === 'ppt') {
      const materi = await this.materisService.findMateriPpt(pertemuanId);
      res.render('materi/ppt', { user: req.user, materi, pertemuan });
    }
  }

  @Roles('admin')
  @Get('formCreate/:jenis_file/:pertemuanId')
  async formEditMateri(
    @Param('pertemuanId') pertemuanId: number,
    @Param('jenis_file') jenis_file: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('admin/materi/create', {
      user: req.user,
      pertemuanId,
      jenis_file,
    });
  }

  @Roles('admin')
  @Get('formEdit/:jenis_file/:id')
  async formEditMateriById(
    @Param('jenis_file') jenis_file: JenisFile,
    @Param('id') id: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const materi = await this.materisService.findOne(id);
      res.render('admin/materi/edit', {
        user: req.user,
        materi,
        jenis_file: materi.jenis_file,
        pertemuanId: materi.pertemuan.id,
      });
    } catch (error: any) {
      req.flash('error', error.message || 'Materi tidak ditemukan');
      res.redirect('/dashboard');
    }
  }

  @Roles('admin')
  @Patch('pdf/:id')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'materi/pdf',
  })
  async updatePdf(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMaterisDto: UpdateMaterisDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const materi = await this.materisService.findOne(id);
    const pertemuanId = materi.pertemuan.id;

    try {
      if (file) {
        await this.materisService.deleteFile(materi.file);
        updateMaterisDto.file = req.body.uploadedFileUrls?.[0];
      } else {
        delete updateMaterisDto.file;
      }

      await this.materisService.update(id, updateMaterisDto);
      req.flash('success', 'Successfully updated PDF material');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update PDF material');
    }
    res.redirect(`/session/${pertemuanId}`);
  }

  @Roles('admin')
  @Patch('ppt/:id')
  async updatePpt(
    @Param('id') id: number,
    @Body() updateMaterisDto: UpdateMaterisDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const materi = await this.materisService.findOne(id);
    const pertemuanId = materi.pertemuan.id;

    try {
      await this.materisService.update(id, updateMaterisDto);
      req.flash('success', 'Successfully updated PPT material');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update PPT material');
    }
    res.redirect(`/session/${pertemuanId}`);
  }

  @Roles('admin')
  @Patch('video/:id')
  async updateVideo(
    @Param('id') id: number,
    @Body() updateMaterisDto: UpdateMaterisDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const materi = await this.materisService.findOne(id);
    const pertemuanId = materi.pertemuan.id;

    try {
      await this.materisService.update(id, updateMaterisDto);
      req.flash('success', 'Successfully updated video material');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update video material');
    }
    res.redirect(`/session/${pertemuanId}`);
  }

  @Roles('admin')
  @Delete(':materiId/:pertemuanId')
  async remove(
    @Param('materiId') materiId: number,
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.materisService.remove(materiId);
      req.flash('success', 'successfully delete materi');
      res.redirect(`/session/${pertemuanId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'failed delete materi');
      res.redirect(`/session/${pertemuanId}`);
    }
  }
}
