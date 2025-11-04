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
  UploadedFile,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { KerjaSamaService } from './kerja_sama.service';
import { CreateKerjaSamaDto } from './dto/create-kerja_sama.dto';
import { UpdateKerjaSamaDto } from './dto/update-kerja_sama.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  createMemoryConfig,
  multerConfigMemory,
} from 'src/common/config/multer.config';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('kerja-sama')
export class KerjaSamaController {
  constructor(private readonly kerjaSamaService: KerjaSamaService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 500,
    minHeight: 300,
    maxHeight: 500,
    maxSize: 5 * 1024 * 1024, 
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/kerja_sama',
  })
  async create(
    @Body() createKerjaSamaDto: CreateKerjaSamaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createKerjaSamaDto.gambar = req.body.uploadedImageUrls?.[0];
      await this.kerjaSamaService.create(createKerjaSamaDto);
      req.flash('success', 'kerja sama successfully created');
      res.redirect('/kerja-sama');
    } catch (error) {
      console.log(error);
      req.flash('error', 'kerja sama failed to create');
      res.redirect('/kerja-sama');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const kerja_sama = await this.kerjaSamaService.findAll();
    res.render('super_admin/kerja_sama/index', { user: req.user, kerja_sama });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/kerja_sama/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get(':kerja_samaId')
  async findOne(
    @Param('kerja_samaId') kerja_samaId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kerja_sama = await this.kerjaSamaService.findOne(kerja_samaId);
    res.render('super_admin/kerja_sama/detail', { user: req.user, kerja_sama });
  }

  @Roles('super_admin')
  @Get('formEdit/:kerja_samaId')
  async formEdit(
    @Param('kerja_samaId') kerja_samaId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kerja_sama = await this.kerjaSamaService.findOne(kerja_samaId);
    res.render('super_admin/kerja_sama/edit', { user: req.user, kerja_sama });
  }

  @Roles('super_admin')
  @Patch(':kerja_samaId')
  @UseInterceptors(
    FileInterceptor(
      'gambar',
      createMemoryConfig({ fileTypes: ['image'], maxSize: 5 }),
    ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 500,
    minHeight: 300,
    maxHeight: 500,
    maxSize: 5 * 1024 * 1024, 
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/kerja_sama',
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('kerja_samaId') kerja_samaId: number,
    @Body() updateKerjaSamaDto: UpdateKerjaSamaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kerja_sama = await this.kerjaSamaService.findOne(kerja_samaId);
      if (gambar) {
        await this.kerjaSamaService.getPublicIdFromUrl(kerja_sama.gambar);
        updateKerjaSamaDto.gambar = req.body.uploadedImageUrls?.[0];
      }
      await this.kerjaSamaService.update(kerja_samaId, updateKerjaSamaDto);
      req.flash('success', 'kerja_sama successfully updated');
      res.redirect('/kerja-sama');
    } catch (error) {
      console.log(error);
      req.flash('error', 'kerja_sama failed to update');
      res.redirect('/kerja-sama');
    }
  }

  @Roles('super_admin')
  @Delete(':kerja_samaId')
  async remove(
    @Param('kerja_samaId') kerja_samaId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kerja_sama = await this.kerjaSamaService.findOne(kerja_samaId);
      if (!kerja_sama) {
        req.flash('error', 'kerja_sama not found');
        res.redirect('/kerja-sama');
      }
      await this.kerjaSamaService.getPublicIdFromUrl(kerja_sama.gambar);
      await this.kerjaSamaService.remove(kerja_samaId);
      req.flash('success', 'kerja_sama successfully remove');
      res.redirect('/kerja-sama');
    } catch (error) {
      req.flash('error', 'kerja_sama failed to remove');
      res.redirect('/kerja-sama');
    }
  }
}
