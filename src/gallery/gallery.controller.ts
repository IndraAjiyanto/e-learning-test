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
  ParseIntPipe,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CategoriesService } from '../categories/categories.service';
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
    private readonly kategorisService: CategoriesService,
  ) {}
 
  // @Get()
  // async findAll(@Res() res: Response, @Req() req: Request) {
  //   const gallery = await this.galleryService.findAll();
  //   res.render('super_admin/gallery/index', { user: req.user, gallery, notSidebar:true});
  // }

 @Get()
  async index(@Res() res: Response) {
    const gallery = await this.galleryService.findAll();
    const programs = await this.kategorisService.findAll();


    res.render('super_admin/gallery/index', { gallery, programs });
  } 


  @Roles('super_admin')
  @Get('formCreate/:categoryId')
  async formCreate(@Param('categoryId') categoryId: string, @Res() res: Response, @Req() req: Request) {
    const category = await this.kategorisService.findOne(+categoryId);
    res.render('super_admin/gallery/create', { user: req.user, category });
  }

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
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
    if (
      !req.body.uploadedImageUrls ||
      req.body.uploadedImageUrls.length === 0
    ) {
      throw new BadRequestException('No image uploaded');
    }

    createGalleryDto.filePath =
      req.body.uploadedImageUrls[0];

    const gallery =
      await this.galleryService.create(createGalleryDto);

    req.flash('success', 'Gallery successfully created');

    res.redirect(`/category/${gallery.category.id}`);

  } catch (error: any) {

    req.flash(
      'error',
      error.message || 'Gallery failed to create'
    );

    res.redirect(
      `/category/${createGalleryDto.category_id}`
    );
  }
}

  @Roles('super_admin')
@Get('category/:categoryId')
async findByKategori(
  @Param('categoryId') categoryId: string,
  @Res() res: Response,
) {
  const gallery = await this.galleryService.findByKategori(+categoryId);
  res.json(gallery);
}

  
  @Roles('super_admin')
@Get('formEdit/:galleryId')
async formEdit(
  @Param('galleryId', ParseIntPipe) galleryId: number,
  @Res() res: Response,
  @Req() req: Request,
) {
  const gallery = await this.galleryService.findOne(galleryId);

  res.render('super_admin/gallery/edit', {
    user: req.user,
    gallery,
    category: gallery.category
  });
}

  

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
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
    const data: UpdateGalleryDto & { filePath?: string } = {
      ...updateGalleryDto,
    };

    if (
      req.body.uploadedImageUrls &&
      req.body.uploadedImageUrls.length > 0
    ) {
      data.filePath = req.body.uploadedImageUrls[0];
    }

    const gallery = await this.galleryService.update(+id, data);

    req.flash('success', 'Gallery successfully updated');

    res.redirect(`/category/${gallery.category.id}`);

  } catch (error: any) {

    req.flash(
      'error',
      error.message || 'Gallery failed to update'
    );

    res.redirect('/categoryId');
  }
}

 @Roles('super_admin')
@Delete(':id')
async remove(
  @Param('id') id: string,
  @Res() res: Response,
  @Req() req: Request,
) {
  try {
    const gallery = await this.galleryService.findOne(+id);

    await this.galleryService.remove(+id);

    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true });
    }

    req.flash('success', 'Gallery successfully deleted');

    return res.redirect(`/category/${gallery.category.id}`);

  } catch (error: any) {

    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    req.flash(
      'error',
      error.message || 'Gallery failed to delete'
    );

    return res.redirect('/category');
  }
}

@Roles('super_admin')
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const gallery = await this.galleryService.findOne(+id);
    res.json(gallery);
  }

 
}

@Controller('dashboard') 
export class PublicGalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly kategorisService: CategoriesService,
  ) {}

  // 1. Menampilkan halaman pertama (Lengkap)
  @Get('gallery') 
  async index(@Res() res: Response) {
    const gallery = await this.galleryService.findAll();
    const programs = await this.kategorisService.findAll();

    return res.render('public/gallery/index', { gallery, programs });
  }

  // 2. Menampilkan halaman kedua (Fitur yang dikurangi)
  @Get('galeri') 
  async dashboard(@Res() res: Response) {
    const gallery = await this.galleryService.findAll();
    const programs = await this.kategorisService.findAll();

    return res.render('partials/dashboard/gallery', { gallery, programs });
  }
}
