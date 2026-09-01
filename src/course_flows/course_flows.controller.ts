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
} from '@nestjs/common';
import { CourseFlowsService } from './course_flows.service';
import { CreateCourseFlowDto } from './dto/create-course_flow.dto';
import { UpdateCourseFlowDto } from './dto/update-course_flow.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('flow-program')
export class CourseFlowsController {
  constructor(private readonly courseFlowsService: CourseFlowsService) {}

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const course_flows = await this.courseFlowsService.findAll();
    res.render('super_admin/course_flows/index', {
      user: req.user,
      course_flows,
    });
  }

  @Roles('super_admin')
  @Get('detail/:courseFlowId')
  async findOneDetail(
    @Param('courseFlowId') courseFlowId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course_flows = await this.courseFlowsService.findOne(courseFlowId);
    res.render('super_admin/course_flows/detail', {
      user: req.user,
      course_flows,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const course = await this.courseFlowsService.findAllCourses();
    res.render('super_admin/course_flows/create', { user: req.user, course });
  }

  @Roles('super_admin')
  @Post()
  async createFromIndex(
    @Body() createCourseFlowDto: CreateCourseFlowDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const courseId = Number(req.body.kelas_id);
      createCourseFlowDto.courseId = courseId;
      await this.courseFlowsService.create(createCourseFlowDto);
      req.flash('success', 'Flow Program successfully created');
      res.redirect(`/flow-program`);
    } catch (error: any) {
      req.flash('error', error.message || 'Flow Program failed to create');
      res.redirect(`/flow-program`);
    }
  }

  @Roles('super_admin')
  @Post(':courseId')
  async create(
    @Param('courseId') courseId: number,
    @Body() createCourseFlowDto: CreateCourseFlowDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createCourseFlowDto.courseId = courseId;
      await this.courseFlowsService.create(createCourseFlowDto);
      req.flash('success', 'alur course successfully created');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'alur course failed to create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:courseId')
  async formCreateWithKelas(
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('super_admin/course_flows/create', { user: req.user, courseId });
  }

  @Roles('super_admin')
  @Get('formEdit/:courseFlowId')
  async formEdit(
    @Param('courseFlowId') courseFlowId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course_flows = await this.courseFlowsService.findOne(courseFlowId);
    res.render('super_admin/course_flows/edit', {
      user: req.user,
      course_flows,
    });
  }

  @Roles('super_admin')
  @Patch(':courseFlowId/:courseId')
  async update(
    @Param('courseFlowId') courseFlowId: number,
    @Param('courseId') courseId: number,
    @Body() updateCourseFlowDto: UpdateCourseFlowDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.courseFlowsService.update(courseFlowId, updateCourseFlowDto);
      req.flash('success', 'Flow Program successfully updated');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Flow Program failed to update');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Delete(':courseFlowId/:courseId')
  async remove(
    @Param('courseFlowId') courseFlowId: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.courseFlowsService.remove(courseFlowId, courseId);
      req.flash('success', 'Flow Program successfully deleted');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Flow Program failed to delete');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
