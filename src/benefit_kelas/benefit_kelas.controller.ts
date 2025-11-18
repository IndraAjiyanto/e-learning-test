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
import { BenefitKelasService } from './benefit_kelas.service';
import { CreateBenefitKelaDto } from './dto/create-benefit_kela.dto';
import { UpdateBenefitKelaDto } from './dto/update-benefit_kela.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('benefit-kelas')
export class BenefitKelasController {
  constructor(private readonly benefitKelasService: BenefitKelasService) {}

  @Roles('super_admin')
  @Post(':kelasId')
  async create(
    @Param('kelasId') kelasId: number,
    @Body() createBenefitKelaDto: CreateBenefitKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createBenefitKelaDto.kelasId = kelasId;
      await this.benefitKelasService.create(createBenefitKelaDto);
      req.flash('success', 'Benefit Program successfully created');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Benefit Program failed to create');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:kelasId')
  async formCreateWithKelas(
    @Res() res: Response,
    @Req() req: Request,
    @Param('kelasId') kelasId: number,
  ) {
    res.render('super_admin/benefit_kelas/create', { user: req.user, kelasId });
  }

  @Roles('super_admin')
  @Get('formEdit/:benefitKelasId')
  async formEdit(
    @Param('benefitKelasId') benefitKelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const benefit_kelas =
      await this.benefitKelasService.findOne(benefitKelasId);
    res.render('super_admin/benefit_kelas/edit', {
      user: req.user,
      benefit_kelas,
    });
  }

  @Roles('super_admin')
  @Patch(':benefitKelasId/:kelasId')
  async update(
    @Param('benefitKelasId') benefitKelasId: number,
    @Param('kelasId') kelasId: number,
    @Body() updateBenefitKelaDto: UpdateBenefitKelaDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.benefitKelasService.update(
        benefitKelasId,
        updateBenefitKelaDto,
      );
      req.flash('success', 'Benefit Program successfully updated');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Benefit Program failed to update');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('super_admin')
  @Delete(':benefitKelasId/:kelasId')
  async remove(
    @Param('benefitKelasId') benefitKelasId: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const benefit_kelas =
        await this.benefitKelasService.findOne(benefitKelasId);
      if (!benefit_kelas) {
        req.flash('error', 'Benefit Program not found');
      }
      await this.benefitKelasService.remove(benefitKelasId);
      req.flash('success', 'Benefit Program successfully deleted');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Benefit Program failed to delete');

      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }
}
