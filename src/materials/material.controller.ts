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
  Query,
  UseFilters,
} from '@nestjs/common';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { FileType } from 'src/entities/materials.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Request, Response } from 'express';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { ValidateFileInterceptor } from 'src/common/interceptors/validate-file.interceptor';
import { ValidateFile } from 'src/common/decorators/validate-file.decorator';
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('learning-material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Roles('admin')
  @Post('pdf/:sessionId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'material/pdf',
    resourceType: 'raw',
  })
  async createPdf(
    @Body() createMaterialDto: CreateMaterialDto,
    @Res() res: Response,
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    try {
      createMaterialDto.file = req.body.uploadedFileUrls?.[0];
      createMaterialDto.sessionId = sessionId;
      createMaterialDto.fileType = 'pdf';
      await this.materialService.create(createMaterialDto);
      flashToast(
        req,
        'Material Created',
        'The new PDF material has been added to this session.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create PDF material');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Post('ppt/:sessionId')
  async createPpt(
    @Body() createMaterialDto: CreateMaterialDto,
    @Res() res: Response,
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    try {
      createMaterialDto.sessionId = sessionId;
      createMaterialDto.fileType = 'ppt';

      await this.materialService.create(createMaterialDto);
      flashToast(
        req,
        'Material Created',
        'The new PPT material has been added to this session.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      console.error('Error creating PPT material:', error);
      req.flash('error', error.message || 'Failed to create PPT material');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Post('video/:sessionId')
  async createVideo(
    @Body() createMaterialDto: CreateMaterialDto,
    @Res() res: Response,
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    try {
      createMaterialDto.sessionId = sessionId;
      createMaterialDto.fileType = 'video';
      await this.materialService.create(createMaterialDto);
      flashToast(
        req,
        'Material Created',
        'The new video material has been added to this session.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create video material');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:id')
  async formCreate(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const materipdf = await this.materialService.findMaterialPdf(id);
    const materivideo = await this.materialService.findMaterialVideo(id);
    const materippt = await this.materialService.findMaterialPpt(id);
    res.render('admin/materi/index', {
      user: req.user,
      id,
      materipdf,
      materippt,
      materivideo,
    });
  }

  @Roles('admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const material = await this.materialService.findOne(id);
    res.render('admin/materi/create', {
      user: req.user,
      sessionId: material.session.id,
      jenis_file: material.fileType,
      editMode: true,
      material,
    });
  }

  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  // @Roles('admin', 'user')
  // @Get('/course/:sessionId')
  // findMateriByKelas(@Param('sessionId') sessionId: string) {
  //   return this.materisService.findMateriBypertemuan(sessionId);
  // }

  @Roles('admin', 'user')
  @Get(':fileType/:sessionId')
  async findMateriByJenisFile(
    @Param('fileType') fileType: FileType,
    @Param('sessionId') sessionId: string,
    @Res() res: Response,
    @Req() req: Request,
    @Query('materialId') materialId?: string,
  ) {
    const session = await this.materialService.findSession(sessionId);

    // Berkas yang diunggah bisa hilang dari disk - misalnya dipindahkan antar
    // mesin sementara barisnya masih ada di basis data. Permintaannya lalu
    // dijawab halaman 404 aplikasi, dan <iframe> penampil dengan patuh
    // menampilkan halaman 404 itu LENGKAP dengan navbar dan tombol WhatsApp-nya
    // di dalam kotak materi. Karena itu keberadaan berkas lokal diperiksa lebih
    // dulu, dan penampil menampilkan keterangan yang jujur.
    //
    // Hanya berkas lokal yang bisa diperiksa; tautan luar (YouTube, Google
    // Slides) dibiarkan apa adanya.
    const STATIC_ROOTS: Record<string, string> = {
      '/asset/': join(process.cwd(), 'public', 'asset'),
      '/uploads/': join(process.cwd(), 'uploads'),
      '/public/': join(process.cwd(), 'src', 'common', 'public'),
    };
    const isMissing = (file?: string) => {
      if (!file || /^https?:\/\//i.test(file)) return false;
      for (const [prefix, root] of Object.entries(STATIC_ROOTS)) {
        if (file.startsWith(prefix)) {
          const rel = decodeURIComponent(file.slice(prefix.length).split('?')[0]);
          return !existsSync(join(root, rel));
        }
      }
      return false;
    };

    // Berkas mana yang langsung dibuka.
    //
    // Penampil ini dulu selalu terbuka kosong dengan tulisan "Select a PDF from
    // the list", bahkan ketika sesinya hanya punya SATU berkas - student harus
    // memilih meski tidak ada pilihan lain. Sekarang: berkas yang disebut
    // `materialId` (ditautkan dari halaman sesi), kalau tidak ada ya yang
    // pertama.
    const pick = <T extends { id: string }>(list: T[]): T | null =>
      (materialId && list.find((m) => m.id === materialId)) || list[0] || null;

    const decorate = <T extends { id: string; file: string }>(list: T[]) =>
      list.map((m) => ({ ...m, missing: isMissing(m.file) }));

    const render = <T extends { id: string; file: string }>(view: string, list: T[]) => {
      const items = decorate(list);
      const selected = pick(items);
      return res.render(view, {
        user: req.user,
        materi: items,
        selected,
        selectedMissing: selected ? isMissing(selected.file) : false,
        session,
        bareShell: true,
      });
    };

    if (fileType === 'video') {
      return render('materi/video', await this.materialService.findMaterialVideo(sessionId));
    } else if (fileType === 'pdf') {
      return render('materi/pdf', await this.materialService.findMaterialPdf(sessionId));
    } else if (fileType === 'ppt') {
      return render('materi/ppt', await this.materialService.findMaterialPpt(sessionId));
    }
  }

  @Roles('admin')
  @Get('formCreate/:jenis_file/:sessionId')
  async formEditMateri(
    @Param('sessionId') sessionId: string,
    @Param('jenis_file') jenis_file: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('admin/materi/create', {
      user: req.user,
      sessionId,
      jenis_file,
    });
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
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const material = await this.materialService.findOne(id);
    const sessionId = material.session.id;

    try {
      if (file) {
        await this.materialService.deleteFile(material.file);
        updateMaterialDto.file = req.body.uploadedFileUrls?.[0];
      }

      await this.materialService.update(id, updateMaterialDto);
      flashToast(req, 'Changes Saved', 'The PDF material has been updated.');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update PDF material');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Patch('ppt/:id')
  async updatePpt(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const material = await this.materialService.findOne(id);
    const sessionId = material.session.id;

    try {
      await this.materialService.update(id, updateMaterialDto);
      flashToast(req, 'Changes Saved', 'The PPT material has been updated.');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update PPT material');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Patch('video/:id')
  async updateVideo(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const material = await this.materialService.findOne(id);
    const sessionId = material.session.id;

    try {
      await this.materialService.update(id, updateMaterialDto);
      flashToast(req, 'Changes Saved', 'The video material has been updated.');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update video material');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Delete(':materialId/:sessionId')
  async remove(
    @Param('materialId') materialId: string,
    @Param('sessionId') sessionId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.materialService.remove(materialId);
      flashToast(
        req,
        'Material Deleted',
        'The material has been permanently removed.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'failed delete materi');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
