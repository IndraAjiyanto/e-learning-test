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
import { TentangService } from './tentang.service';
import { CreateTentangDto } from './dto/create-tentang.dto';
import { UpdateTentangDto } from './dto/update-tentang.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('tentang')
export class TentangController {
  constructor(private readonly tentangService: TentangService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 700,
    maxWidth: 4000,
    minHeight: 700,
    maxHeight: 4000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'tentang',
  })
  async create(
    @Body() createTentangDto: CreateTentangDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createTentangDto.gambar = req.body.uploadedImageUrls?.[0];
      await this.tentangService.create(createTentangDto);
      req.flash('success', 'Header successfully created');
      res.redirect('/about');
    } catch (error) {
      req.flash('error', error.message || 'Header failed to create');
      res.redirect('/about');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const tentang = await this.tentangService.findAll();
    res.render('super_admin/tentang/index', { user: req.user, tentang });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/tentang/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const tentang = await this.tentangService.findOne(id);
    res.render('super_admin/tentang/detail', { user: req.user, tentang });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const tentang = await this.tentangService.findOne(id);
    res.render('super_admin/tentang/edit', { user: req.user, tentang });
  }

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 700,
    maxWidth: 4000,
    minHeight: 700,
    maxHeight: 4000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'tentang',
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('id') id: number,
    @Body() updateTentangDto: UpdateTentangDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const tentang = await this.tentangService.findOne(id);
      if (gambar) {
        await this.tentangService.deleteFile(tentang.gambar);
        updateTentangDto.gambar = req.body.uploadedImageUrls?.[0];
      }
      await this.tentangService.update(id, updateTentangDto);
      req.flash('success', 'Header successfully updated');
      res.redirect('/about');
    } catch (error) {
      req.flash('error', error.message || 'Header failed to update');
      res.redirect('/about');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const tentang = await this.tentangService.findOne(id);
      await this.tentangService.deleteFile(tentang.gambar);
      await this.tentangService.remove(id);
      req.flash('success', 'Header successfully deleted');
      res.redirect('/about');
    } catch (error) {
      req.flash('error', error.message || 'Header failed to delete');
      res.redirect('/about');
    }
  }
}
