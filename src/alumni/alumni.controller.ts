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
import { AlumniService } from './alumni.service';
import { CreateAlumnusDto } from './dto/create-alumnus.dto';
import { UpdateAlumnusDto } from './dto/update-alumnus.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  createMemoryConfig,
  multerConfigImage,
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
@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024, // 1MB max
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/alumni',
  })
  async create(
    @Body() createAlumnusDto: CreateAlumnusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createAlumnusDto.profile = req.body.uploadedImageUrls?.[0];
      await this.alumniService.create(createAlumnusDto);
      req.flash('success', 'Alumni successfully created');
      res.redirect('/alumni');
    } catch (error) {
      console.log(error);
      req.flash('error', error.message || 'Alumni failed to create');
      res.redirect('/alumni');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const alumni = await this.alumniService.findAll();
    res.render('super_admin/alumni/index', { user: req.user, alumni });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const kelas = await this.alumniService.findAllKelas();
    res.render('super_admin/alumni/create', { user: req.user, kelas });
  }

  @Roles('super_admin')
  @Get('formEdit/:alumniId')
  async formEdit(
    @Param('alumniId') alumniId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const alumni = await this.alumniService.findOne(alumniId);
    const kelas = await this.alumniService.findAllKelas();
    res.render('super_admin/alumni/edit', { user: req.user, alumni, kelas });
  }

  @Roles('super_admin')
  @Patch(':alumniId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024, // 5MB max (kept consistent with create)
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/alumni',
  })
  async update(
    @UploadedFile() profile: Express.Multer.File,
    @Param('alumniId') alumniId: number,
    @Body() updateAlumnusDto: UpdateAlumnusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const alumni = await this.alumniService.findOne(alumniId);
      if (profile) {
        // remove old image if exists (public id extraction)
        await this.alumniService.getPublicIdFromUrl(alumni.profile);
        // ValidateImageInterceptor uploads and sets uploadedImageUrls on the body (same as create)
        updateAlumnusDto.profile = req.body.uploadedImageUrls?.[0];
      }
      await this.alumniService.update(alumniId, updateAlumnusDto);
      req.flash('success', 'Alumni successfully updated');
      res.redirect('/alumni');
    } catch (error) {
      console.log(error);
      req.flash('error', error.message || 'Alumni failed to update');
      res.redirect('/alumni');
    }
  }

  @Roles('super_admin')
  @Delete(':alumniId')
  async remove(
    @Param('alumniId') alumniId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const alumni = await this.alumniService.findOne(alumniId);
      if (!alumni) {
        req.flash('error', 'Alumni not found');
        res.redirect('/alumni');
      }
      await this.alumniService.getPublicIdFromUrl(alumni.profile);
      await this.alumniService.remove(alumniId);
      req.flash('success', 'Alumni successfully removed');
      res.redirect('/alumni');
    } catch (error) {
      req.flash('error', error.message || 'Alumni failed to remove');
      res.redirect('/alumni');
    }
  }
}
