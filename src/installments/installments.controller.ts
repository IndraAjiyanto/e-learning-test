import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { CreateInstallmentsDto } from './dto/create-installments.dto';
import { UpdateInstallmentsDto } from './dto/update-installments.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@UseGuards(AuthenticatedGuard)
@Controller('installment')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Roles('super_admin')
  @Get('formCreate/:courseId')
  async formCreate(
    @Req() req: Request,
    @Res() res: Response,
    @Param('courseId') courseId: number,
  ) {
    const availableMonths = await this.installmentsService.findNo(courseId);
    res.render('super_admin/installments/create', { user: req.user, courseId, availableMonths });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const installments = await this.installmentsService.findOne(id);
    const availableMonths = await this.installmentsService.findNo(installments.course.id);
    res.render('super_admin/installments/edit', { user: req.user, installments, availableMonths });
  }

  @Roles('super_admin')
  @Post(':courseId')
  async create(
    @Body() createCicilanDto: CreateInstallmentsDto,
    @Req() req: Request,
    @Res() res: Response,
    @Param('courseId') courseId: number,
  ) {
    try {
      if (createCicilanDto.price && Array.isArray(createCicilanDto.price)) {
        createCicilanDto.price = createCicilanDto.price.map((h) => Number(h));
      }

      if (createCicilanDto.downPayment !== undefined) {
        createCicilanDto.downPayment = Number(createCicilanDto.downPayment);
      }

      createCicilanDto.courseId = Number(courseId);
      createCicilanDto.month = Number(createCicilanDto.month) as 3 | 6 | 12;

      await this.installmentsService.create(createCicilanDto);
      req.flash('success', 'Installment created successfully');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create installment');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCicilanDto: UpdateInstallmentsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (updateCicilanDto.price && Array.isArray(updateCicilanDto.price)) {
        updateCicilanDto.price = updateCicilanDto.price.map((h) => Number(h));
      }

      if (updateCicilanDto.downPayment !== undefined) {
        updateCicilanDto.downPayment = Number(updateCicilanDto.downPayment);
      }

      if (updateCicilanDto.month) {
        updateCicilanDto.month = Number(updateCicilanDto.month) as 3 | 6 | 12;
      }

      const installments = await this.installmentsService.update(id, updateCicilanDto);
      req.flash('success', 'Installment updated successfully');
      res.redirect(`/program/detail/program/admin/${installments.course.id}`);
    } catch (error: any) {
      const installments = await this.installmentsService.findOne(id);
      req.flash('error', error.message || 'Failed to update installment');
      res.redirect(`/program/detail/program/admin/${installments.course.id}`);
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const installments = await this.installmentsService.findOne(id);
      const courseId = installments.course.id;
      await this.installmentsService.remove(id);
      req.flash('success', 'Installment deleted successfully');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      const installments = await this.installmentsService.findOne(id);
      const courseId = installments.course.id;
      req.flash('error', error.message || 'Failed to delete installment');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
