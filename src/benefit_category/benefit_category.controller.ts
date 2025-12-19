import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Redirect,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { BenefitCategoryService } from './benefit_category.service';
import { CreateBenefitCategoryDto } from './dto/create-benefit_category.dto';
import { UpdateBenefitCategoryDto } from './dto/update-benefit_category.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('benefit_category')
export class BenefitCategoryController {
  constructor(
    private readonly benefitCategoryService: BenefitCategoryService,
  ) {}

  @Roles('super_admin')
  @Get('formCreate/:kategoriId')
  async formCreate(@Param('kategoriId') kategoriId: number, @Req() req: Request, @Res() res: Response) {
    res.render('super_admin/benefit_category/create', { user: req.user, kategoriId });
  }

  @Roles('super_admin')
  @Post(':kategoriId')
  async createFromForm(
    @Body() createBenefitCategoryDto: CreateBenefitCategoryDto, @Param('kategoriId') kategoriId: number, @Req() req: Request, @Res() res: Response
  ) {
    try {
      createBenefitCategoryDto.kategoriId = kategoriId;
    await this.benefitCategoryService.create(createBenefitCategoryDto);
    req.flash('success', 'benefit category successfully created');
    res.redirect('/kategoris/'+kategoriId);
    } catch (error) {
          req.flash('error', 'Failed to create benefit category');
    res.redirect('/kategoris/'+kategoriId);
    }
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(@Param('id') id: number, @Req() req: Request, @Res() res: Response) {
    const benefitCategory = await this.benefitCategoryService.findOne(id);
    res.render('super_admin/benefit_category/edit', { benefitCategory, user: req.user });
  }

  @Roles('super_admin')
  @Patch('formEdit/:id/:kategoriId')
  async updateFromForm(
    @Param('id') id: number, 
    @Param('kategoriId') kategoriId: number,
    @Body() updateBenefitCategoryDto: UpdateBenefitCategoryDto, @Req() req: Request, @Res() res: Response
  ) {
    try {
    await this.benefitCategoryService.update(id, updateBenefitCategoryDto);
    req.flash('success', 'Benefit category successfully updated');
    res.redirect('/kategoris/'+kategoriId);
    } catch (error) {
      req.flash('error', 'Failed to update benefit category');
      res.redirect('/kategoris/'+kategoriId);
    }
  }

  @Roles('super_admin')
  @Delete(':id/:kategoriId')
  async deleteFromForm(@Param('id') id: number, @Param('kategoriId') kategoriId: number, @Req() req: Request, @Res() res: Response) {
    try {
      await this.benefitCategoryService.remove(id);
      req.flash('success', 'Benefit category successfully deleted');
      res.redirect('/kategoris/'+kategoriId);
    } catch (error) {
      req.flash('error', 'Failed to delete benefit category');
      res.redirect('/kategoris/'+kategoriId);
    }
  }
}
