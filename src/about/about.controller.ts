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
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 700,
    maxWidth: 4000,
    minHeight: 700,
    maxHeight: 4000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'about',
  })
  async create(
    @Body() createTentangDto: CreateAboutDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createTentangDto.image = req.body.uploadedImageUrls?.[0];
      await this.aboutService.create(createTentangDto);
      flashToast(
        req,
        'Header Created',
        'The header has been added successfully.',
      );
      res.redirect('/about');
    } catch (error: any) {
      req.flash('error', error.message || 'Header failed to create');
      res.redirect('/about');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const about = await this.aboutService.findAll();
    res.render('super_admin/about/index', { user: req.user, about });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/about/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const about = await this.aboutService.findOne(id);
    res.redirect(`/about/formEdit/${id}`);
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const about = await this.aboutService.findOne(id);
    res.render('super_admin/about/edit', { user: req.user, about });
  }

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 700,
    maxWidth: 4000,
    minHeight: 700,
    maxHeight: 4000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'about',
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('id') id: string,
    @Body() updateTentangDto: UpdateAboutDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const about = await this.aboutService.findOne(id);
      if (gambar) {
        await this.aboutService.deleteFile(about.image);
        updateTentangDto.image = req.body.uploadedImageUrls?.[0];
      }
      await this.aboutService.update(id, updateTentangDto);
      flashToast(
        req,
        'Header Updated',
        'The header has been updated successfully.',
      );
      res.redirect('/about');
    } catch (error: any) {
      req.flash('error', error.message || 'Header failed to update');
      res.redirect('/about');
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
      const about = await this.aboutService.findOne(id);
      await this.aboutService.deleteFile(about.image);
      await this.aboutService.remove(id);
      flashToast(
        req,
        'Header Deleted',
        'The header has been deleted successfully.',
      );
      res.redirect('/about');
    } catch (error: any) {
      req.flash('error', error.message || 'Header failed to delete');
      res.redirect('/about');
    }
  }
}
