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
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
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
  @Post(':kelasId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'alumni',
  })
  async create(
    @Param('kelasId') kelasId: number,
    @Body() createAlumnusDto: CreateAlumnusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createAlumnusDto.profile = req.body.uploadedImageUrls?.[0];
      createAlumnusDto.kelasId = kelasId;
      await this.alumniService.create(createAlumnusDto);
      req.flash('success', 'Alumni successfully created');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Alumni failed to create');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Post('create/:kategoriId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'alumni',
  })
  async createAlumni(
    @Param('kategoriId') kategoriId: number,
    @Body() createAlumnusDto: CreateAlumnusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createAlumnusDto.profile = req.body.uploadedImageUrls?.[0];
      await this.alumniService.create(createAlumnusDto);
      req.flash('success', 'Alumni successfully created');
      res.redirect(`/kategoris/${kategoriId}`);
    } catch (error) {
      req.flash('error', error.message || 'Alumni failed to create');
      res.redirect(`/kategoris/${kategoriId}`);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:kelasId')
  async formCreate(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('super_admin/alumni/create', { user: req.user, kelasId });
  }

  @Roles('super_admin')
  @Get('kategori/formCreate/:kategoriId')
  async formCreateByKategori(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelas = await this.alumniService.findKelasByKategori(kategoriId);
    res.render('super_admin/alumni/createAlumni', {
      user: req.user,
      kategoriId,
      kelas,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:alumniId')
  async formEdit(
    @Param('alumniId') alumniId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const alumni = await this.alumniService.findOne(alumniId);
    res.render('super_admin/alumni/edit', { user: req.user, alumni });
  }

  @Roles('super_admin')
  @Get('kategori/formEdit/:alumniId')
  async formEditAlumni(
    @Param('alumniId') alumniId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const alumni = await this.alumniService.findOne(alumniId);
    res.render('super_admin/alumni/editAlumni', { user: req.user, alumni });
  }

  @Roles('super_admin')
  @Patch(':alumniId/:kelasId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'alumni',
  })
  async update(
    @UploadedFile() profile: Express.Multer.File,
    @Param('alumniId') alumniId: number,
    @Param('kelasId') kelasId: number,
    @Body() updateAlumnusDto: UpdateAlumnusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const alumni = await this.alumniService.findOne(alumniId);
      if (profile) {
        await this.alumniService.deleteFile(alumni.profile);
        updateAlumnusDto.profile = req.body.uploadedImageUrls?.[0];
      }
      await this.alumniService.update(alumniId, updateAlumnusDto);
      req.flash('success', 'Alumni successfully updated');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Alumni failed to update');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Patch('kategori/:alumniId/:kategoriId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'alumni',
  })
  async updateAlumni(
    @UploadedFile() profile: Express.Multer.File,
    @Param('alumniId') alumniId: number,
    @Param('kategoriId') kategoriId: number,
    @Body() updateAlumnusDto: UpdateAlumnusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const alumni = await this.alumniService.findOne(alumniId);
      if (profile) {
        await this.alumniService.deleteFile(alumni.profile);
        updateAlumnusDto.profile = req.body.uploadedImageUrls?.[0];
      }
      await this.alumniService.update(alumniId, updateAlumnusDto);
      req.flash('success', 'Alumni successfully updated');
      res.redirect(`/kategoris/${kategoriId}`);
    } catch (error) {
      req.flash('error', error.message || 'Alumni failed to update');
      res.redirect(`/kategoris/${kategoriId}`);
    }
  }

  @Roles('super_admin')
  @Delete(':alumniId/:kelasId')
  async remove(
    @Param('alumniId') alumniId: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const alumni = await this.alumniService.findOne(alumniId);
      if (!alumni) {
        req.flash('error', 'Alumni not found');
        res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
      }
      await this.alumniService.deleteFile(alumni.profile);
      await this.alumniService.remove(alumniId);
      req.flash('success', 'Alumni successfully removed');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Alumni failed to remove');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Delete('kategori/:alumniId/:kategoriId')
  async removeAlumni(
    @Param('alumniId') alumniId: number,
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const alumni = await this.alumniService.findOne(alumniId);
      if (!alumni) {
        req.flash('error', 'Alumni not found');
        res.redirect(`/kategoris/${kategoriId}`);
      }
      await this.alumniService.deleteFile(alumni.profile);
      await this.alumniService.remove(alumniId);
      req.flash('success', 'Alumni successfully removed');
      res.redirect(`/kategoris/${kategoriId}`);
    } catch (error) {
      req.flash('error', error.message || 'Alumni failed to remove');
      res.redirect(`/kategoris/${kategoriId}`);
    }
  }
}
