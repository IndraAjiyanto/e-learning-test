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
import axios from 'axios';
import { join } from 'node:path';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  createMemoryConfig,
  multerConfigMemoryOnly,
} from 'src/common/config/multer.config';
import { FileType, FILE_TYPE_LABEL } from 'src/entities/materials.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Request, Response } from 'express';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { ValidateFileInterceptor } from 'src/common/interceptors/validate-file.interceptor';
import { ValidateFile } from 'src/common/decorators/validate-file.decorator';
import { flashToast, flashToastError } from 'src/common/utils/toast.util';
import { GoogleSlidesService } from './google-slides.service';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('learning-material')
export class MaterialController {
  constructor(
    private readonly materialService: MaterialService,
    private readonly googleSlidesService: GoogleSlidesService,
  ) {}

  private validateDownloadUrl(downloadUrl?: string | null): string {
    const trimmed = (downloadUrl || '').trim();
    if (!trimmed) {
      throw new Error('Please enter a Google Slides download URL.');
    }
    const googleSlidePattern = /^https:\/\/docs\.google\.com\/presentation\//;
    if (!googleSlidePattern.test(trimmed)) {
      throw new Error(
        'Download URL must be a valid Google Slides link (https://docs.google.com/presentation/...).',
      );
    }
    return trimmed;
  }

  private resolvePptLink(dto: CreateMaterialDto | UpdateMaterialDto): string {
    const link = (dto.link || '').trim();
    if (
      link &&
      !(
        /^https:\/\/docs\.google\.com\/presentation\//.test(link) &&
        (link.includes('/pub') || link.includes('/embed'))
      )
    ) {
      throw new Error(
        'Please use a published Google Slides URL (File → Share → Publish to web).',
      );
    }
    return link;
  }

  private parseFileType(jenisFile: string): FileType | null {
    if (jenisFile === 'pdf' || jenisFile === 'ppt' || jenisFile === 'video') {
      return jenisFile;
    }
    return null;
  }

  private async discardUploadedFile(req: Request): Promise<void> {
    const urls = (req.body as { uploadedFileUrls?: string[] })
      ?.uploadedFileUrls;
    if (!urls?.length) return;
    await this.materialService.deleteFile(urls[0]);
  }

  @Roles('admin', 'super_admin')
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
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      createMaterialDto.file =
        (req.body as { uploadedFileUrls?: string[] })?.uploadedFileUrls?.[0] ||
        '';
      createMaterialDto.originalFileName = file?.originalname;
      createMaterialDto.fileSizeBytes = file?.size;
      createMaterialDto.sessionId = sessionId;
      createMaterialDto.fileType = 'pdf';
      await this.materialService.create(createMaterialDto);
      flashToast(
        req,
        'Material Created',
        'The new PDF material has been added to this session.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to create material',
        err.message || 'Failed to create PDF material',
      );
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Post('ppt/:sessionId')
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMemoryConfig({ fileTypes: ['ppt'], maxSize: 50 }),
    ),
  )
  async createPpt(
    @Body() createMaterialDto: CreateMaterialDto,
    @Res() res: Response,
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const link = this.resolvePptLink(createMaterialDto);
      if (file && link) {
        throw new Error(
          'Please choose either a file upload or a Google Slides link, not both.',
        );
      }
      if (!file && !link) {
        throw new Error(
          'Please upload a PPT/PPTX file or provide a published Google Slides link.',
        );
      }
      if (link) {
        createMaterialDto.file = link;
        createMaterialDto.driveFileId = undefined;
      } else {
        const uploaded = await this.googleSlidesService.upload(file);
        createMaterialDto.file = uploaded.url;
        createMaterialDto.driveFileId = uploaded.fileId;
      }
      createMaterialDto.originalFileName = file?.originalname;
      createMaterialDto.fileSizeBytes = file?.size;
      createMaterialDto.downloadUrl = this.validateDownloadUrl(
        createMaterialDto.downloadUrl,
      );
      createMaterialDto.sessionId = sessionId;
      createMaterialDto.fileType = 'ppt';

      await this.materialService.create(createMaterialDto);
      flashToast(
        req,
        'Material Created',
        'The new PPT material has been added to this session.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to create material',
        err.message || 'Failed to create PPT material',
      );
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin', 'super_admin')
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
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to create material',
        err.message || 'Failed to create video material',
      );
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Post('syllabus/pdf/:syllabusId')
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
  async createPdfForSyllabus(
    @Body() createMaterialDto: CreateMaterialDto,
    @Res() res: Response,
    @Param('syllabusId') syllabusId: string,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let materialSaved = false;
    try {
      await this.materialService.assertSyllabusSlotAvailable(syllabusId, 'pdf');

      createMaterialDto.file =
        (req.body as { uploadedFileUrls?: string[] })?.uploadedFileUrls?.[0] ||
        '';
      createMaterialDto.originalFileName = file?.originalname;
      createMaterialDto.fileSizeBytes = file?.size;
      createMaterialDto.syllabusId = syllabusId;
      createMaterialDto.sessionId = undefined;
      createMaterialDto.fileType = 'pdf';
      await this.materialService.create(createMaterialDto);
      materialSaved = true;
      flashToast(
        req,
        'Material Created',
        'The new PDF material has been added to this syllabus.',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    } catch (error: unknown) {
      if (!materialSaved) {
        await this.discardUploadedFile(req);
      }
      const err = error as Error;
      flashToastError(
        req,
        'Failed to create material',
        err.message || 'Failed to create PDF material',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Post('syllabus/ppt/:syllabusId')
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMemoryConfig({ fileTypes: ['ppt'], maxSize: 50 }),
    ),
  )
  async createPptForSyllabus(
    @Body() createMaterialDto: CreateMaterialDto,
    @Res() res: Response,
    @Param('syllabusId') syllabusId: string,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      await this.materialService.assertSyllabusSlotAvailable(syllabusId, 'ppt');

      const link = this.resolvePptLink(createMaterialDto);
      if (file && link) {
        throw new Error(
          'Please choose either a file upload or a Google Slides link, not both.',
        );
      }
      if (!file && !link) {
        throw new Error(
          'Please upload a PPT/PPTX file or provide a published Google Slides link.',
        );
      }
      if (link) {
        createMaterialDto.file = link;
        createMaterialDto.driveFileId = undefined;
      } else {
        const uploaded = await this.googleSlidesService.upload(file);
        createMaterialDto.file = uploaded.url;
        createMaterialDto.driveFileId = uploaded.fileId;
      }
      createMaterialDto.originalFileName = file?.originalname;
      createMaterialDto.fileSizeBytes = file?.size;
      createMaterialDto.downloadUrl = this.validateDownloadUrl(
        createMaterialDto.downloadUrl,
      );
      createMaterialDto.syllabusId = syllabusId;
      createMaterialDto.sessionId = undefined;
      createMaterialDto.fileType = 'ppt';

      await this.materialService.create(createMaterialDto);
      flashToast(
        req,
        'Material Created',
        'The new PPT material has been added to this syllabus.',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to create material',
        err.message || 'Failed to create PPT material',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Post('syllabus/video/:syllabusId')
  async createVideoForSyllabus(
    @Body() createMaterialDto: CreateMaterialDto,
    @Res() res: Response,
    @Param('syllabusId') syllabusId: string,
    @Req() req: Request,
  ) {
    try {
      await this.materialService.assertSyllabusSlotAvailable(
        syllabusId,
        'video',
      );

      createMaterialDto.syllabusId = syllabusId;
      createMaterialDto.sessionId = undefined;
      createMaterialDto.fileType = 'video';
      await this.materialService.create(createMaterialDto);
      flashToast(
        req,
        'Material Created',
        'The new video material has been added to this syllabus.',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to create material',
        err.message || 'Failed to create video material',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Get('formCreate/:id')
  async formCreate(
    @Param('id') id: string,
    @Req() req: Request,
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

  @Roles('admin', 'super_admin')
  @Get('formCreate/syllabus/:jenis_file/:syllabusId')
  async formCreateForSyllabus(
    @Param('syllabusId') syllabusId: string,
    @Param('jenis_file') jenis_file: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const fileType = this.parseFileType(jenis_file);
    if (fileType) {
      const existing = await this.materialService.findSyllabusMaterialByType(
        syllabusId,
        fileType,
      );
      if (existing) {
        flashToastError(
          req,
          'Material Already Exists',
          `Materi ${FILE_TYPE_LABEL[fileType]} untuk syllabus ini sudah ada. ` +
            'Silakan edit materi yang tersedia untuk menggantinya.',
        );
        return res.redirect(`/syllabus/${syllabusId}`);
      }
    }

    res.render('admin/materi/create', {
      user: req.user,
      syllabusId,
      syllabusMode: true,
      jenis_file,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const material = await this.materialService.findOne(id);
    res.render('admin/materi/create', {
      user: req.user,
      sessionId: material.session?.id || '',
      syllabusId: material.syllabus?.id || '',
      syllabusMode: !!material.syllabus?.id,
      jenis_file: material.fileType,
      editMode: true,
      material,
    });
  }

  @Roles('admin', 'user', 'super_admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  // @Roles('admin', 'user')
  // @Get('/course/:sessionId')
  // findMateriByKelas(@Param('sessionId') sessionId: string) {
  //   return this.materisService.findMateriBypertemuan(sessionId);
  // }

  @Roles('user', 'admin', 'super_admin')
  @Get(':id/download')
  async downloadMaterial(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const material = await this.materialService.findOne(id);
    if (!material) {
      req.flash('error', 'Berkas materi tidak ditemukan.');
      return res.redirect('back');
    }

    if (material.fileType === 'video') {
      req.flash('error', 'Berkas video tidak dapat diunduh.');
      return res.redirect('back');
    }

    const isPpt = material.fileType === 'ppt';
    const ext = isPpt ? '.pptx' : '.pdf';
    const defaultBase = isPpt
      ? material.title || 'materi-presentasi'
      : material.title || 'materi-pdf';
    const safeFilename =
      material.originalFileName && material.originalFileName.endsWith(ext)
        ? material.originalFileName
        : `${material.originalFileName || defaultBase}${ext}`;

    if (isPpt) {
      let downloadUrl = material.downloadUrl?.trim();
      if (!downloadUrl) {
        req.flash(
          'error',
          'Tautan unduhan belum disediakan untuk materi slide ini.',
        );
        return res.redirect('back');
      }

      // Jika admin memasukkan link Google Slides share/edit/embed, ubah otomatis ke export/pptx
      const match = downloadUrl.match(/\/presentation\/d\/(?!e\/)([^/?#]+)/);
      if (match && !downloadUrl.includes('/export/pptx')) {
        downloadUrl = `https://docs.google.com/presentation/d/${match[1]}/export/pptx`;
      }

      if (
        downloadUrl.startsWith('http://') ||
        downloadUrl.startsWith('https://')
      ) {
        try {
          const response = await axios.get(downloadUrl, {
            responseType: 'stream',
            timeout: 30000,
          });

          res.set({
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFilename)}"`,
          });

          return response.data.pipe(res);
        } catch (err: unknown) {
          req.flash(
            'error',
            'Gagal mengunduh berkas presentasi dari tautan penyedia.',
          );
          return res.redirect('back');
        }
      }

      const rel = downloadUrl.startsWith('/')
        ? downloadUrl.slice(1)
        : downloadUrl;
      const candidates = [
        join(process.cwd(), rel),
        join(process.cwd(), 'uploads', rel),
        join(process.cwd(), 'public', rel),
      ];

      for (const filePath of candidates) {
        if (existsSync(filePath)) {
          return res.download(filePath, safeFilename);
        }
      }

      req.flash('error', 'Berkas fisik tidak ditemukan di server.');
      return res.redirect('back');
    }

    // Untuk file PDF
    const fileUrl = material.file;
    if (!fileUrl) {
      req.flash('error', 'Tautan unduhan tidak tersedia.');
      return res.redirect('back');
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return res.redirect(fileUrl);
    }

    const rel = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const candidates = [
      join(process.cwd(), rel),
      join(process.cwd(), 'uploads', rel),
      join(process.cwd(), 'public', rel),
    ];

    for (const filePath of candidates) {
      if (existsSync(filePath)) {
        return res.download(filePath, safeFilename);
      }
    }

    req.flash('error', 'Berkas fisik tidak ditemukan di server.');
    return res.redirect('back');
  }

  @Roles('admin', 'user', 'super_admin')
  @Get(':fileType/:sessionId')
  async findMateriByJenisFile(
    @Param('fileType') fileType: FileType,
    @Param('sessionId') sessionId: string,
    @Res() res: Response,
    @Req() req: Request,
    @Query('materialId') materialId?: string,
  ) {
    const session = await this.materialService.findSession(sessionId);

    const STATIC_ROOTS: Record<string, string> = {
      '/asset/': join(process.cwd(), 'public', 'asset'),
      '/uploads/': join(process.cwd(), 'uploads'),
      '/public/': join(process.cwd(), 'src', 'common', 'public'),
    };
    const isMissing = (file?: string) => {
      if (!file || /^https?:\/\//i.test(file)) return false;
      for (const [prefix, root] of Object.entries(STATIC_ROOTS)) {
        if (file.startsWith(prefix)) {
          const rel = decodeURIComponent(
            file.slice(prefix.length).split('?')[0],
          );
          return !existsSync(join(root, rel));
        }
      }
      return false;
    };

    const pick = <T extends { id: string }>(list: T[]): T | null =>
      (materialId && list.find((m) => m.id === materialId)) || list[0] || null;

    const decorate = <T extends { id: string; file: string }>(list: T[]) =>
      list.map((m) => ({ ...m, missing: isMissing(m.file) }));

    const render = <T extends { id: string; file: string }>(
      view: string,
      list: T[],
    ) => {
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
      return render(
        'materi/video',
        await this.materialService.findMaterialVideo(sessionId),
      );
    } else if (fileType === 'pdf') {
      return render(
        'materi/pdf',
        await this.materialService.findMaterialPdf(sessionId),
      );
    } else if (fileType === 'ppt') {
      return render(
        'materi/ppt',
        await this.materialService.findMaterialPpt(sessionId),
      );
    }
  }

  @Roles('admin', 'super_admin')
  @Get('formCreate/:jenis_file/:sessionId')
  formEditMateri(
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

  @Roles('admin', 'super_admin')
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
    const redirectPath = this.materialService.findRedirectPath(material);

    try {
      if (file) {
        await this.materialService.deleteFile(material.file);
        updateMaterialDto.file =
          (req.body as { uploadedFileUrls?: string[] })
            ?.uploadedFileUrls?.[0] || '';
        updateMaterialDto.originalFileName = file.originalname;
        updateMaterialDto.fileSizeBytes = file.size;
      }

      await this.materialService.update(id, updateMaterialDto);
      flashToast(req, 'Changes Saved', 'The PDF material has been updated.');
      res.redirect(redirectPath);
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to update material',
        err.message || 'Failed to update PDF material',
      );
      res.redirect(redirectPath);
    }
  }

  @Roles('admin', 'super_admin')
  @Patch('ppt/:id')
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMemoryConfig({ fileTypes: ['ppt'], maxSize: 50 }),
    ),
  )
  async updatePpt(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const material = await this.materialService.findOne(id);
    const redirectPath = this.materialService.findRedirectPath(material);

    try {
      const link = this.resolvePptLink(updateMaterialDto);
      if (file && link) {
        throw new Error(
          'Please choose either a file upload or a Google Slides link, not both.',
        );
      }
      if (link) {
        if (material.driveFileId) {
          try {
            await this.googleSlidesService.delete(
              material.file,
              material.driveFileId,
            );
          } catch {
            // The old presentation may belong to a different Drive owner.
          }
        }
        updateMaterialDto.file = link;
        updateMaterialDto.driveFileId = null;
      } else if (file) {
        const uploaded = await this.googleSlidesService.upload(
          file,
          material.file,
          material.driveFileId,
        );
        updateMaterialDto.file = uploaded.url;
        updateMaterialDto.driveFileId = uploaded.fileId;
        updateMaterialDto.originalFileName = file.originalname;
        updateMaterialDto.fileSizeBytes = file.size;
      } else {
        updateMaterialDto.file = material.file;
      }
      updateMaterialDto.downloadUrl = this.validateDownloadUrl(
        updateMaterialDto.downloadUrl !== undefined
          ? updateMaterialDto.downloadUrl
          : material.downloadUrl,
      );
      await this.materialService.update(id, updateMaterialDto);
      flashToast(req, 'Changes Saved', 'The PPT material has been updated.');
      res.redirect(redirectPath);
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to update material',
        err.message || 'Failed to update PPT material',
      );
      res.redirect(redirectPath);
    }
  }

  @Roles('admin', 'super_admin')
  @Patch('video/:id')
  async updateVideo(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const material = await this.materialService.findOne(id);
    const redirectPath = this.materialService.findRedirectPath(material);

    try {
      await this.materialService.update(id, updateMaterialDto);
      flashToast(req, 'Changes Saved', 'The video material has been updated.');
      res.redirect(redirectPath);
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to update material',
        err.message || 'Failed to update video material',
      );
      res.redirect(redirectPath);
    }
  }

  @Roles('admin', 'super_admin')
  @Delete('syllabus/:materialId/:syllabusId')
  async removeForSyllabus(
    @Param('materialId') materialId: string,
    @Param('syllabusId') syllabusId: string,
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
      res.redirect(`/syllabus/${syllabusId}`);
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to delete material',
        err.message || 'Failed to delete material',
      );
      res.redirect(`/syllabus/${syllabusId}`);
    }
  }

  @Roles('admin', 'super_admin')
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
    } catch (error: unknown) {
      const err = error as Error;
      flashToastError(
        req,
        'Failed to delete material',
        err.message || 'Failed to delete material',
      );
      res.redirect(`/session/${sessionId}`);
    }
  }
}
