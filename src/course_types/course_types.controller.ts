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
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CourseTypesService } from './course_types.service';
import { CreateCourseTypeDto } from './dto/create-course_type.dto';
import { UpdateCourseTypeDto } from './dto/update-course_type.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';
import { flashToast } from 'src/common/utils/toast.util';

@Controller('type-program')
export class CourseTypesController {
  constructor(private readonly courseTypeService: CourseTypesService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createJenisKelaDto: CreateCourseTypeDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.courseTypeService.create(createJenisKelaDto);
      flashToast(
        req,
        'Program Type Created',
        'The program type has been added successfully.',
      );
      res.redirect('/type-program');
    } catch (error: any) {
      req.flash('error', 'Program type failed to created');
      res.render('type-program');
    }
  }

  // Didaftarkan sebelum route ber-parameter supaya segmen statis 'filter'
  // tidak pernah ditangkap sebagai id.
  @Roles('super_admin')
  @Get('filter')
  async filterCourseTypes(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = parseInt(page || '1', 10);
    const itemsPerPage = parseInt(limit || '10', 10);

    const result = await this.courseTypeService.findAllPaginated({
      search: search || undefined,
      page: currentPage,
      limit: itemsPerPage,
    });

    return res.json({
      data: result.data,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / itemsPerPage),
      currentPage,
    });
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const courseType = await this.courseTypeService.findAll();
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
  @Get('formEdit/:courseTypeId')
  async formEdit(
    @Param('courseTypeId') courseTypeId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const courseType = await this.courseTypeService.findOne(courseTypeId);
    res.render('super_admin/courseType/edit', { user: req.user, courseType });
  }

  @Roles('super_admin')
  @Patch(':courseTypeId')
  @UseInterceptors(FileInterceptor('icon', multerConfigImage))
  async update(
    @Param('courseTypeId') courseTypeId: string,
    @UploadedFile() icon: Express.Multer.File,
    @Body() updateJenisKelaDto: UpdateCourseTypeDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const courseType = await this.courseTypeService.findOne(courseTypeId);
      await this.courseTypeService.update(courseTypeId, updateJenisKelaDto);
      flashToast(
        req,
        'Program Type Updated',
        'The changes to this program type have been saved.',
      );
      res.redirect('/type-program');
    } catch (error: any) {
      req.flash('error', error.message || 'Program type failed to updated');
      res.redirect('/type-program');
    }
  }

  @Roles('super_admin')
  @Delete(':courseTypeId')
  async remove(
    @Param('courseTypeId') courseTypeId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const courseType = await this.courseTypeService.findOne(courseTypeId);
      if (!courseType) {
        req.flash('error', 'courseType not found');
        return res.redirect('/type-program');
      }
      await this.courseTypeService.remove(courseTypeId);
      flashToast(
        req,
        'Program Type Deleted',
        'The program type has been removed successfully.',
      );
      res.redirect('/type-program');
    } catch (error: any) {
      req.flash('error', error.message || 'Program type failed to deleted');
      res.redirect('/type-program');
    }
  }
}
