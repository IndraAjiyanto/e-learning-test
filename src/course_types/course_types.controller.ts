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
} from '@nestjs/common';
import { CourseTypesService } from './course_types.service';
import { CreateJenisKelaDto } from './dto/create-jenis_kela.dto';
import { UpdateJenisKelaDto } from './dto/update-jenis_kela.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';

@Controller('type-program')
export class CourseTypesController {
  constructor(private readonly jenisKelasService: CourseTypesService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createJenisKelaDto: CreateJenisKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.jenisKelasService.create(createJenisKelaDto);
      req.flash('success', 'Program type successfully created');
      res.redirect('/type-program');
    } catch (error: any) {
      req.flash('error', 'Program type failed to created');
      res.render('type-program');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const courseType = await this.jenisKelasService.findAll();
    res.render('super_admin/courseType/index', {
      user: req.user,
      courseType,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Req() req: Request, @Res() res: Response) {
    res.render('super_admin/courseType/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:jenis_kelasId')
  async formEdit(
    @Param('jenis_kelasId') jenis_kelasId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const courseType = await this.jenisKelasService.findOne(jenis_kelasId);
    res.render('super_admin/courseType/edit', { user: req.user, courseType });
  }

  @Roles('super_admin')
  @Patch(':jenis_kelasId')
  @UseInterceptors(FileInterceptor('icon', multerConfigImage))
  async update(
    @Param('jenis_kelasId') jenis_kelasId: number,
    @UploadedFile() icon: Express.Multer.File,
    @Body() updateJenisKelaDto: UpdateJenisKelaDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const courseType = await this.jenisKelasService.findOne(jenis_kelasId);
      await this.jenisKelasService.update(jenis_kelasId, updateJenisKelaDto);
      req.flash('success', 'Program type successfully update');
      res.redirect('/type-program');
    } catch (error: any) {
      req.flash('error', error.message || 'Program type failed to updated');
      res.redirect('/type-program');
    }
  }

  @Roles('super_admin')
  @Delete(':jenis_kelasId')
  async remove(
    @Param('jenis_kelasId') jenis_kelasId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const courseType = await this.jenisKelasService.findOne(jenis_kelasId);
      if (!courseType) {
        req.flash('error', 'courseType not found');
        return res.redirect('/type-program');
      }
      await this.jenisKelasService.remove(jenis_kelasId);
      req.flash('success', 'Program type successfully delete');
      res.redirect('/type-program');
    } catch (error: any) {
      req.flash('error', error.message || 'Program type failed to deleted');
      res.redirect('/type-program');
    }
  }
}
