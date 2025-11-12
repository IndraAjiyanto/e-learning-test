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
import { createMemoryConfig } from 'src/common/config/multer.config';
import { JenisFile } from 'src/entities/materi.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Request, Response } from 'express';
import { join } from 'path';
import { promises as fs } from 'fs';
import { LibreOfficeService } from 'src/common/config/libreoffice.service';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { ValidateFileInterceptor } from 'src/common/interceptors/validate-file.interceptor';
import { ValidateFile } from 'src/common/decorators/validate-file.decorator';
import { ValidateFileOnlyInterceptor } from 'src/common/interceptors/validate-file-only.interceptor';
import { ValidateFileOnly } from 'src/common/decorators/validate-file-only.decorator';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('materis')
export class MaterisController {
  constructor(
    private readonly materisService: MaterisService,
    private readonly libreOfficeService: LibreOfficeService,
  ) {}

  @Roles('admin')
  @Post('pdf/:pertemuanId')
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMemoryConfig({ fileTypes: ['pdf'], maxSize: 10 }),
    ),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'nestjs/pdf',
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
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', 'Failed to create PDF material');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Post('ppt/:pertemuanId')
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMemoryConfig({ fileTypes: ['ppt'], maxSize: 50 }),
    ),
    ValidateFileOnlyInterceptor,
  )
  @ValidateFileOnly({
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    fileExtensions: ['.ppt', '.pptx'],
  })
  async createPpt(
    @Body() createMaterisDto: CreateMaterisDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Param('pertemuanId') pertemuanId: number,
    @Req() req: Request,
  ) {
    try {
      // Validasi file
      if (!file) {
        req.flash('error', 'PPT/PPTX file is required');
        return res.redirect(`/pertemuans/${pertemuanId}`);
      }

      // 1️⃣ Simpan file sementara
      const tmpDir = join(process.cwd(), 'tmp');
      await fs.mkdir(tmpDir, { recursive: true });

      const fileExtension = file.originalname.toLowerCase().endsWith('.pptx')
        ? '.pptx'
        : '.ppt';
      const tmpFileName = `ppt-${Date.now()}${fileExtension}`;
      const tmpPath = join(tmpDir, tmpFileName);
      await fs.writeFile(tmpPath, file.buffer);

      const slideOutputDir = join(process.cwd(), 'tmp', `slides-${Date.now()}`);

      let pptUrl: string;
      let slideUrls: string[];

      try {
        const uploadResult =
          await this.libreOfficeService.convertAndUploadPptToCloudinary(
            tmpPath,
            slideOutputDir,
            pertemuanId,
          );

        pptUrl = uploadResult.pptUrl;
        slideUrls = uploadResult.slideUrls;

        console.log(
          `Successfully processed PPT with ${slideUrls.length} slides`,
        );
      } catch (convertError) {
        console.error('LibreOffice conversion/upload error:', convertError);
        // Cleanup jika gagal
        try {
          await fs.unlink(tmpPath);
        } catch (e) {
          console.error('Cleanup error:', e);
        }

        req.flash(
          'error',
          'Failed to convert and upload PPT. Please make sure LibreOffice is installed correctly',
        );
        return res.redirect(`/pertemuans/${pertemuanId}`);
      }

      // 3️⃣ Simpan ke database
      createMaterisDto.file = pptUrl;
      createMaterisDto.pertemuanId = pertemuanId;
      createMaterisDto.jenis_file = 'ppt';
      createMaterisDto.slides = slideUrls;

      await this.materisService.create(createMaterisDto);

      // 4️⃣ Cleanup file temporary setelah berhasil (hanya folder slides, PPT sudah dihapus di libreOfficeService)
      try {
        await fs.rm(slideOutputDir, { recursive: true, force: true }); // Hapus folder slides temporary
        console.log('Temporary files cleaned up successfully');
      } catch (cleanupError) {
        console.error('Cleanup error (non-critical):', cleanupError);
      }

      req.flash(
        'success',
        `Successfully uploaded PPT with ${slideUrls.length} slides`,
      );
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      console.error('PPT upload error:', error);
      req.flash('error', 'Failed to upload PPT material');
      res.redirect(`/pertemuans/${pertemuanId}`);
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
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', 'Failed to create video material');
      res.redirect(`/pertemuans/${pertemuanId}`);
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

  @Roles('admin', 'user')
  @Get('/kelas/:pertemuanId')
  findMateriByKelas(@Param('pertemuanId') pertemuanId: number) {
    return this.materisService.findMateriBypertemuan(pertemuanId);
  }

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
  @Patch('pdf/:id')
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMemoryConfig({ fileTypes: ['pdf'], maxSize: 10 }),
    ),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'nestjs/pdf',
  })
  async updatePdf(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMaterisDto: UpdateMaterisDto,
    @Req() req: Request,
  ) {
    const materi = await this.materisService.findOne(id);

    if (file) {
      await this.materisService.getPublicIdFromUrl(materi.file);
      updateMaterisDto.file = req.body.uploadedFileUrls?.[0];
    }

    return await this.materisService.update(id, updateMaterisDto);
  }

  @Roles('admin')
  @Patch('ppt/:id')
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMemoryConfig({ fileTypes: ['ppt'], maxSize: 50 }),
    ),
    ValidateFileOnlyInterceptor,
  )
  @ValidateFileOnly({
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    fileExtensions: ['.ppt', '.pptx'],
  })
  async updatePpt(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMaterisDto: UpdateMaterisDto,
    @Req() req: Request,
  ) {
    const materi = await this.materisService.findOne(id);

    if (file) {
      await this.materisService.getPublicIdFromUrl(materi.file);

      // Untuk update PPT, perlu proses convert juga jika diperlukan
      // Untuk saat ini kita skip convert, hanya update file saja
      // Jika butuh convert ulang, implementasi sama seperti create
      updateMaterisDto.file = materi.file; // Keep existing for now
    }

    return await this.materisService.update(id, updateMaterisDto);
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
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', 'failed delete materi');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }
}
