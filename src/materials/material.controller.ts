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
    @Param('sessionId') sessionId: number,
    @Req() req: Request,
  ) {
    try {
      createMaterialDto.file = req.body.uploadedFileUrls?.[0];
      createMaterialDto.sessionId = sessionId;
      createMaterialDto.fileType = 'pdf';
      await this.materialService.create(createMaterialDto);
      req.flash('success', 'Successfully created PDF material');
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
    @Param('sessionId') sessionId: number,
    @Req() req: Request,
  ) {
    try {
      createMaterialDto.sessionId = sessionId;
      createMaterialDto.fileType = 'ppt';

      await this.materialService.create(createMaterialDto);
      req.flash('success', 'Successfully created PPT material');
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
    @Param('sessionId') sessionId: number,
    @Req() req: Request,
  ) {
    try {
      createMaterialDto.sessionId = sessionId;
      createMaterialDto.fileType = 'video';
      await this.materialService.create(createMaterialDto);
      req.flash('success', 'Successfully created video material');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create video material');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:id')
  async formCreate(
    @Param('id') id: number,
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

  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.materialService.findOne(id);
  }

  // @Roles('admin', 'user')
  // @Get('/course/:sessionId')
  // findMateriByKelas(@Param('sessionId') sessionId: number) {
  //   return this.materisService.findMateriBypertemuan(sessionId);
  // }

  @Roles('admin', 'user')
  @Get(':fileType/:sessionId')
  async findMateriByJenisFile(
    @Param('fileType') fileType: FileType,
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const session = await this.materialService.findSession(sessionId);
    if (fileType === 'video') {
      const materi = await this.materialService.findMaterialVideo(sessionId);
      res.render('materi/video', { user: req.user, materi, session });
    } else if (fileType === 'pdf') {
      const materi = await this.materialService.findMaterialPdf(sessionId);
      res.render('materi/pdf', { user: req.user, materi, session });
    } else if (fileType === 'ppt') {
      const materi = await this.materialService.findMaterialPpt(sessionId);
      res.render('materi/ppt', { user: req.user, materi, session });
    }
  }

  @Roles('admin')
  @Get('formCreate/:jenis_file/:sessionId')
  async formEditMateri(
    @Param('sessionId') sessionId: number,
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
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req: Request,
  ) {
    const material = await this.materialService.findOne(id);

    if (file) {
      await this.materialService.deleteFile(material.file);
      updateMaterialDto.file = req.body.uploadedFileUrls?.[0];
    }

    return await this.materialService.update(id, updateMaterialDto);
  }

  @Roles('admin')
  @Patch('ppt/:id')
  async updatePpt(
    @Param('id') id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req: Request,
  ) {
    const material = await this.materialService.findOne(id);
    return await this.materialService.update(id, updateMaterialDto);
  }

  @Roles('admin')
  @Delete(':materialId/:sessionId')
  async remove(
    @Param('materialId') materialId: number,
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.materialService.remove(materialId);
      req.flash('success', 'successfully delete materi');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'failed delete materi');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
