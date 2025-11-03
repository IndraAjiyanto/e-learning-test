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
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { TentangService } from './tentang.service';
import { CreateTentangDto } from './dto/create-tentang.dto';
import { UpdateTentangDto } from './dto/update-tentang.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  createMemoryConfig,
  multerConfigMemory,
} from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@Controller('tentang')
export class TentangController {
  constructor(private readonly tentangService: TentangService) {}

  // Public Routes
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const tentangList = await this.tentangService.findAll();
    res.render('tentang', {
      user: req.user,
      tentangList,
    });
  }

  // Admin Routes
  @UseGuards(AuthenticatedGuard)
  @UseFilters(FileUploadExceptionFilter)
  @UseInterceptors(MulterErrorInterceptor)
  @Roles('super_admin')
  @Get('admin/list')
  async adminList(@Res() res: Response, @Req() req: Request) {
    const tentangList = await this.tentangService.findAll();
    res.render('super_admin/tentang/index', {
      user: req.user,
      tentangList,
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get('admin/formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/tentang/create', {
      user: req.user,
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get('admin/formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const tentang = await this.tentangService.findOne(+id);
    res.render('super_admin/tentang/edit', {
      user: req.user,
      tentang,
    });
  }

  @UseGuards(AuthenticatedGuard)
  @UseFilters(FileUploadExceptionFilter)
  @UseInterceptors(MulterErrorInterceptor)
  @Roles('super_admin')
  @Post('admin/create')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 400,
    maxWidth: 1920,
    minHeight: 300,
    maxHeight: 1080,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/tentang',
  })
  async create(
    @Body() createTentangDto: CreateTentangDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createTentangDto.gambar = req.body.uploadedImageUrls?.[0];
      await this.tentangService.create(createTentangDto);
      req.flash('success', 'Tentang successfully created');
      res.redirect('/tentang/admin/list');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Tentang failed to create');
      res.redirect('/tentang/admin/list');
    }
  }

  @UseGuards(AuthenticatedGuard)
  @UseFilters(FileUploadExceptionFilter)
  @UseInterceptors(MulterErrorInterceptor)
  @Roles('super_admin')
  @Patch('admin/update/:id')
  @UseInterceptors(
    FileInterceptor(
      'gambar',
      createMemoryConfig({ fileTypes: ['image'], maxSize: 5 }),
    ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 400,
    maxWidth: 1920,
    minHeight: 300,
    maxHeight: 1080,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/tentang',
  })
  async update(
    @Param('id') id: number,
    @Body() updateTentangDto: UpdateTentangDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const tentang = await this.tentangService.findOne(+id);
      if (req.body.uploadedImageUrls && req.body.uploadedImageUrls.length > 0) {
        await this.tentangService.getPublicIdFromUrl(tentang.gambar);
        updateTentangDto.gambar = req.body.uploadedImageUrls?.[0];
      }
      await this.tentangService.update(+id, updateTentangDto);
      req.flash('success', 'Tentang successfully updated');
      res.redirect('/tentang/admin/list');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Tentang failed to update');
      res.redirect('/tentang/admin/list');
    }
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Delete('admin/delete/:id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const tentang = await this.tentangService.findOne(+id);
      if (!tentang) {
        req.flash('error', 'Tentang not found');
        res.redirect('/tentang/admin/list');
      }
      await this.tentangService.getPublicIdFromUrl(tentang.gambar);
      await this.tentangService.remove(+id);
      req.flash('success', 'Tentang successfully removed');
      res.redirect('/tentang/admin/list');
    } catch (error) {
      req.flash('error', 'Tentang failed to remove');
      res.redirect('/tentang/admin/list');
    }
  }
}
