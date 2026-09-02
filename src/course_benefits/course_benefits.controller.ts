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
import { ProgramBenefitService } from './course_benefits.service';
import { CreateCourseBenefitDto } from './dto/create-course_benefit.dto';
import { UpdateCourseBenefitDto } from './dto/update-course_benefit.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('benefit-program')
export class ProgramBenefitController {
  constructor(private readonly programBenefitService: ProgramBenefitService) {}

  @Roles('super_admin')
  @Post(':courseId')
  async create(
    @Param('courseId') courseId: string,
    @Body() createProgramBenefitDto: CreateCourseBenefitDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createProgramBenefitDto.courseId = courseId;
      await this.programBenefitService.create(createProgramBenefitDto);
      req.flash('success', 'Benefit Program successfully created');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Benefit Program failed to create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:courseId')
  async formCreateWithKelas(
    @Res() res: Response,
    @Req() req: Request,
    @Param('courseId') courseId: string,
  ) {
    res.render('super_admin/course_benefits/create', {
      user: req.user,
      courseId,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:programBenefitId')
  async formEdit(
    @Param('programBenefitId') programBenefitId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const program_benefit =
      await this.programBenefitService.findOne(programBenefitId);
    res.render('super_admin/course_benefits/edit', {
      user: req.user,
      program_benefit,
    });
  }

  @Roles('super_admin')
  @Patch(':programBenefitId/:courseId')
  async update(
    @Param('programBenefitId') programBenefitId: string,
    @Param('courseId') courseId: string,
    @Body() updateProgramBenefitDto: UpdateCourseBenefitDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.programBenefitService.update(
        programBenefitId,
        updateProgramBenefitDto,
      );
      req.flash('success', 'Benefit Program successfully updated');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Benefit Program failed to update');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Delete(':programBenefitId/:courseId')
  async remove(
    @Param('programBenefitId') programBenefitId: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const program_benefit =
        await this.programBenefitService.findOne(programBenefitId);
      if (!program_benefit) {
        req.flash('error', 'Benefit Program not found');
      }
      await this.programBenefitService.remove(programBenefitId);
      req.flash('success', 'Benefit Program successfully deleted');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Benefit Program failed to delete');

      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
