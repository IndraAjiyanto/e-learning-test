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
  @Post(':courseId')
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
    @Param('courseId') courseId: number,
    @Body() createAlumnusDto: CreateAlumnusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createAlumnusDto.profile = req.body.uploadedImageUrls?.[0];
      createAlumnusDto.courseId = courseId;
      await this.alumniService.create(createAlumnusDto);
      req.flash('success', 'Alumni successfully created');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Alumni failed to create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Post('create/:categoryId')
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
    @Param('categoryId') categoryId: number,
    @Body() createAlumnusDto: CreateAlumnusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createAlumnusDto.profile = req.body.uploadedImageUrls?.[0];
      await this.alumniService.create(createAlumnusDto);
      req.flash('success', 'Alumni successfully created');
      res.redirect(`/category/${categoryId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Alumni failed to create');
      res.redirect(`/category/${categoryId}`);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:courseId')
  async formCreate(
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('super_admin/alumni/create', { user: req.user, courseId });
  }

  @Roles('super_admin')
  @Get('category/formCreate/:categoryId')
  async formCreateByKategori(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course = await this.alumniService.findCourseByKategori(categoryId);
    res.render('super_admin/alumni/createAlumni', {
      user: req.user,
      categoryId,
      course,
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
  @Get('category/formEdit/:alumniId')
  async formEditAlumni(
    @Param('alumniId') alumniId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const alumni = await this.alumniService.findOne(alumniId);
    res.render('super_admin/alumni/editAlumni', { user: req.user, alumni });
  }

  @Roles('super_admin')
  @Patch(':alumniId/:courseId')
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
    @Param('courseId') courseId: number,
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
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Alumni failed to update');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Patch('category/:alumniId/:categoryId')
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
    @Param('categoryId') categoryId: number,
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
      res.redirect(`/category/${categoryId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Alumni failed to update');
      res.redirect(`/category/${categoryId}`);
    }
  }

  @Get('filter')
  async filterAlumni(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const kategoriId = req.query.kategori_id ? Number(req.query.kategori_id) : undefined;
      const kelasId = req.query.kelas_id ? Number(req.query.kelas_id) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 6;

      const result = await this.alumniService.filterAlumni(
        kategoriId,
        kelasId,
        search,
        page,
        limit,
      );

      res.json({
        data: result.data,
        totalItems: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Filter failed' });
    }
  }

  @Roles('super_admin')
  @Delete(':alumniId/:courseId')
  async remove(
    @Param('alumniId') alumniId: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const alumni = await this.alumniService.findOne(alumniId);
      if (!alumni) {
        req.flash('error', 'Alumni not found');
        res.redirect(`/program/detail/program/admin/${courseId}`);
      }
      await this.alumniService.deleteFile(alumni.profile);
      await this.alumniService.remove(alumniId);
      req.flash('success', 'Alumni successfully removed');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Alumni failed to remove');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Delete('category/:alumniId/:categoryId')
  async removeAlumni(
    @Param('alumniId') alumniId: number,
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const alumni = await this.alumniService.findOne(alumniId);
      if (!alumni) {
        req.flash('error', 'Alumni not found');
        res.redirect(`/category/${categoryId}`);
      }
      await this.alumniService.deleteFile(alumni.profile);
      await this.alumniService.remove(alumniId);
      req.flash('success', 'Alumni successfully removed');
      res.redirect(`/category/${categoryId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Alumni failed to remove');
      res.redirect(`/category/${categoryId}`);
    }
  }
}
