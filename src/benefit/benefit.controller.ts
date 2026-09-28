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
import { BenefitService } from './benefit.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Controller('benefit')
export class BenefitController {
  constructor(private readonly benefitService: BenefitService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Res() res: Response,
    @Req() req: Request,
    @Body() createBenefitDto: CreateBenefitDto,
  ) {
    try {
      await this.benefitService.create(createBenefitDto);
      flashToast(
        req,
        'Benefit Created',
        'The benefit has been added successfully.',
      );
      res.redirect('/benefit');
    } catch (error: any) {
      req.flash('error', error.message || 'Benefit failed to create');
      res.redirect('/benefit');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const benefit = await this.benefitService.findAll();
    const isMaxBenefit = benefit.length >= 5;
    res.render('super_admin/benefit/index', {
      user: req.user,
      benefit,
      isMaxBenefit,
      benefitCount: benefit.length,
      maxBenefit: 5,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const count = await this.benefitService.count();
    if (count >= 5) {
      flashToast(
        req,
        'Limit Reached',
        'Maksimal 5 benefit telah tercapai. Tidak dapat menambah benefit baru.',
      );
      return res.redirect('/benefit');
    }

    const availableNumbers = await this.benefitService.findNo();

    res.render('super_admin/benefit/create', {
      user: req.user,
      availableNumbers,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:benefitId')
  async formEdit(
    @Param('benefitId') benefitId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const benefit = await this.benefitService.findOne(benefitId);
    const availableNumbers = await this.benefitService.findNoForEdit(benefitId);
    res.render('super_admin/benefit/edit', {
      user: req.user,
      benefit,
      availableNumbers,
    });
  }

  @Roles('super_admin')
  @Patch(':benefitId')
  async update(
    @Param('benefitId') benefitId: string,
    @Body() updateBenefitDto: UpdateBenefitDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.benefitService.update(benefitId, updateBenefitDto);
      flashToast(
        req,
        'Changes Saved',
        'The benefit has been updated successfully.',
      );
      res.redirect('/benefit');
    } catch (error: any) {
      req.flash('error', error.message || 'Benefit failed to update');
      res.redirect('/benefit');
    }
  }

  @Roles('super_admin')
  @Delete(':benefitId')
  async remove(
    @Param('benefitId') benefitId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.benefitService.remove(benefitId);
      flashToast(
        req,
        'Benefit Deleted',
        'The benefit has been removed successfully.',
      );
      res.redirect('/benefit');
    } catch (error: any) {
      req.flash('error', error.message || 'Benefit failed to delete');
      res.redirect('/benefit');
    }
  }
}
