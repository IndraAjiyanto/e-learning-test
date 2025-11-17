import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  UseInterceptors,
  UploadedFile,
  UseFilters,
} from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemory } from 'src/common/config/multer.config';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('kategoris')
export class KategorisController {
  constructor(private readonly kategorisService: KategorisService) {}

  @Roles('super_admin')
  @Post()
    @UseInterceptors(
      FileInterceptor('icon', multerConfigMemory),
      ValidateImageInterceptor,
    )
    @ValidateImage({
      minWidth: 1000,
      maxWidth: 2000,
      minHeight: 1000,
      maxHeight: 2000,
      folder: 'nestjs/images/kategori',
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    })
  async create(
    @Body() createKategorisDto: CreateKategorisDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createKategorisDto.icon = req.body.uploadedImageUrls?.[0];
      await this.kategorisService.create(createKategorisDto);
      req.flash('success', 'kategori successfully created');
      res.redirect('/kategoris');
    } catch (error) {
      req.flash('error', error.message || 'kategori failed to create');
      res.redirect('/kategoris');
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/kategori/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const kategori = await this.kategorisService.findAll();
    res.render('super_admin/kategori/index', { user: req.user, kategori });
  }

  @Roles('super_admin')
  @Get(':kategoriId')
  async findOne(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kategori = await this.kategorisService.findOne(kategoriId);
    res.render('super_admin/kategori/detail', { user: req.user, kategori });
  }

  @Roles('super_admin')
  @Get('formEdit/:kategoriId')
  async formEdit(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kategori = await this.kategorisService.findOne(kategoriId);
    res.render('super_admin/kategori/edit', { user: req.user, kategori });
  }

  @Roles('super_admin')
  @Patch(':kategoriId')
      @UseInterceptors(
      FileInterceptor('icon', multerConfigMemory),
      ValidateImageInterceptor,
    )
    @ValidateImage({
      minWidth: 1000,
      maxWidth: 2000,
      minHeight: 1000,
      maxHeight: 2000,
      folder: 'nestjs/images/kategori',
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    })
  async update(
    @Param('kategoriId') kategoriId: number,
    @Body() updateKategorisDto: UpdateKategorisDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kategori = await this.kategorisService.findOne(kategoriId);
      if(req.body.uploadedImageUrls){
        await this.kategorisService.getPublicIdFromUrl(kategori.icon);
        updateKategorisDto.icon = req.body.uploadedImageUrls?.[0];
      }
      await this.kategorisService.update(kategoriId, updateKategorisDto);
      req.flash('success', 'kategori successfully updated');
      res.redirect('/kategoris');
    } catch (error) {
      req.flash('error', error.message || 'kategori failed to update');
      res.redirect('/kategoris');
    }
  }

  @Roles('super_admin')
  @Delete(':kategoriId')
  async remove(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kategori = await this.kategorisService.findOne(kategoriId);
      await this.kategorisService.getPublicIdFromUrl(kategori.icon);
      await this.kategorisService.remove(kategoriId);
      req.flash('success', 'kategori successfully deleted');
      res.redirect('/kategoris');
    } catch (error) {
      req.flash('success', 'kategori failed to delete');
      res.redirect('/kategoris');
    }
  }
}
