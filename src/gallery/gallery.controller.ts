import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Req, Res, UseFilters } from '@nestjs/common';
import { GalleryService } from './gallery.service';
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
  constructor(private readonly galleryService: GalleryService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(FileInterceptor('gambar', multerConfigMemoryOnly), ValidateImageInterceptor)
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


  console.log('BODY:', req.body);
  console.log('uploadedImageUrls:', req.body.uploadedImageUrls);

    if (!req.body.uploadedImageUrls || req.body.uploadedImageUrls.length === 0) {
      throw new BadRequestException('No image uploaded');
    }
    createGalleryDto.file_path = req.body.uploadedImageUrls[0];
    await this.galleryService.create(createGalleryDto);
    req.flash('success', 'Gallery successfully created');
    res.redirect('/gallery');
  }

  @Get()
  findAll() {
    return this.galleryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(+id);
  }

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('gambar', multerConfigMemoryOnly), ValidateImageInterceptor)
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
    @Req() req: Request,
  ) {
    const data: UpdateGalleryDto & { file_path?: string } = { ...updateGalleryDto };

    if (req.body.uploadedImageUrls && req.body.uploadedImageUrls.length > 0) {
      data.file_path = req.body.uploadedImageUrls[0];
    }

    return this.galleryService.update(+id, data);
  }

  @Roles('super_admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(+id);
  }
}