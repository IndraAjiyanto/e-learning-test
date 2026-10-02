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
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Controller('installment')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Roles('super_admin')
  @Get('formCreate/:courseId')
  async formCreate(
    @Req() req: Request,
    @Res() res: Response,
    @Param('courseId') courseId: string,
  ) {
    const availableMonths = await this.installmentsService.findNo(courseId);
    res.render('super_admin/installments/create', {
      user: req.user,
      courseId,
      availableMonths,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const installments = await this.installmentsService.findOne(id);
    const availableMonths = await this.installmentsService.findNo(
      installments.course.id,
    );
    res.render('super_admin/installments/edit', {
      user: req.user,
      installments,
      availableMonths,
    });
  }

  @Roles('super_admin')
  @Post(':courseId')
  async create(
    @Body() createCicilanDto: CreateInstallmentsDto,
    @Req() req: Request,
    @Res() res: Response,
    @Param('courseId') courseId: string,
  ) {
    try {
      if (createCicilanDto.price && Array.isArray(createCicilanDto.price)) {
        createCicilanDto.price = createCicilanDto.price.map((h) => Number(h));
      }

      if (createCicilanDto.downPayment !== undefined) {
        createCicilanDto.downPayment = Number(createCicilanDto.downPayment);
      }

      createCicilanDto.courseId = String(courseId);
      createCicilanDto.month = Number(createCicilanDto.month) as 3;

      await this.installmentsService.create(createCicilanDto);
      flashToast(
        req,
        'Installment Created',
        'The installment plan has been added successfully.',
      );
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create installment');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
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
        updateCicilanDto.month = Number(updateCicilanDto.month) as 3;
      }

      const installments = await this.installmentsService.update(
        id,
        updateCicilanDto,
      );
      flashToast(
        req,
        'Installment Updated',
        'The changes to this installment plan have been saved.',
      );
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
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const installments = await this.installmentsService.findOne(id);
      const courseId = installments.course.id;
      await this.installmentsService.remove(id);
      flashToast(
        req,
        'Installment Deleted',
        'The installment plan has been removed successfully.',
      );
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      const installments = await this.installmentsService.findOne(id);
      const courseId = installments.course.id;
      req.flash('error', error.message || 'Failed to delete installment');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
