import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseInterceptors,
  UseFilters,
  BadRequestException,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { KategorisService } from '../kategoris/kategoris.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { Response, Request } from 'express';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly kategorisService: KategorisService,
  ) {}

  // ============================
  // LIST — GET /gallery
  // ============================
  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const gallery = await this.galleryService.findAll();
    res.render('super_admin/gallery/index', { user: req.user, gallery });
  }

  // ============================
  // FORM CREATE — GET /gallery/formCreate
  // (harus di atas ':id' supaya tidak tertabrak)
  // ============================
  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const kategori = await this.kategorisService.findAll();
    res.render('super_admin/gallery/create', { user: req.user, kategori });
  }

  // ============================
  // SUBMIT CREATE — POST /gallery
  // ============================
  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'program',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async create(
    @Body() createGalleryDto: CreateGalleryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      if (!req.body.uploadedImageUrls || req.body.uploadedImageUrls.length === 0) {
        throw new BadRequestException('No image uploaded');
      }
      createGalleryDto.file_path = req.body.uploadedImageUrls[0];
      await this.galleryService.create(createGalleryDto);
      req.flash('success', 'Gallery successfully created');
      res.redirect('/gallery');
    } catch (error: any) {
      req.flash('error', error.message || 'Gallery failed to create');
      res.redirect('/gallery');
    }
  }

  // ============================
  // FORM EDIT — GET /gallery/formEdit/:id
  // ============================
  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const [gallery, kategori] = await Promise.all([
      this.galleryService.findOne(+id),
      this.kategorisService.findAll(),
    ]);
    res.render('super_admin/gallery/edit', { user: req.user, gallery, kategori });
  }

  // ============================
  // DETAIL — GET /gallery/:id
  // (opsional; boleh dihapus kalau tidak butuh halaman detail terpisah)
  // ============================
  @Roles('super_admin')
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const gallery = await this.galleryService.findOne(+id);
    res.json(gallery);
  }

  // ============================
  // SUBMIT UPDATE — PATCH /gallery/:id
  // ============================
  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'program',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async update(
    @Param('id') id: string,
    @Body() updateGalleryDto: UpdateGalleryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const data: UpdateGalleryDto & { file_path?: string } = {
        ...updateGalleryDto,
      };
      if (req.body.uploadedImageUrls && req.body.uploadedImageUrls.length > 0) {
        data.file_path = req.body.uploadedImageUrls[0];
      }
      await this.galleryService.update(+id, data);
      req.flash('success', 'Gallery successfully updated');
      res.redirect('/gallery');
    } catch (error: any) {
      req.flash('error', error.message || 'Gallery failed to update');
      res.redirect('/gallery');
    }
  }

  // ============================
  // SUBMIT DELETE — DELETE /gallery/:id
  // ============================
  @Roles('super_admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response, @Req() req: Request) {
    try {
      await this.galleryService.remove(+id);
      req.flash('success', 'Gallery successfully deleted');
      res.redirect('/gallery');
    } catch (error: any) {
      req.flash('error', error.message || 'Gallery failed to delete');
      res.redirect('/gallery');
    }
  }
}