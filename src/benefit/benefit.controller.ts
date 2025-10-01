import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { BenefitService } from './benefit.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('benefit')
export class BenefitController {
  constructor(private readonly benefitService: BenefitService) {}

  @Roles('super_admin')
  @Post()
  async create(@Res() res:Response,@Req() req: Request,@Body() createBenefitDto: CreateBenefitDto) {
    try {
    await this.benefitService.create(createBenefitDto);
    req.flash('success', 'benefit successfully created')
    res.redirect('/benefit')
    } catch (error) {
      req.flash('erros', 'benefit failed to create')
    res.redirect('/benefit')
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res:Response,@Req() req: Request) {
     const benefit = await this.benefitService.findAll();
     res.render('super_admin/benefit/index', {user: req.user, benefit})
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res:Response,@Req() req: Request){
    res.render('super_admin/benefit/create', {user: req.user})
  }

  @Roles('super_admin')
  @Get('formEdit/:benefitId')
  async formEdit(@Param('benefitId') benefitId: number, @Res() res:Response,@Req() req: Request) {
    const benefit = await this.benefitService.findOne(benefitId);
    res.render('super_admin/benefit/edit', {user: req.user, benefit})
  }

  @Roles('super_admin')
  @Patch(':benefitId')
  async update(@Param('benefitId') benefitId: number, @Body() updateBenefitDto: UpdateBenefitDto, @Res() res:Response,@Req() req: Request) {
    try {
      await this.benefitService.update(benefitId, updateBenefitDto);
      req.flash('success', 'benefit successfully updated')
      res.redirect('/benefit')
    } catch (error) {
      req.flash('error', 'benefit failed  to updat')
      res.redirect('/benefit')
    }
  }

  @Roles('super_admin')
  @Delete(':benefitId')
  async remove(@Param('benefitId') benefitId: number, @Res() res:Response,@Req() req: Request) {
    try {
      await this.benefitService.remove(benefitId);
            req.flash('success', 'benefit successfully deleted')
      res.redirect('/benefit')
    } catch (error) {
            req.flash('error', 'benefit failed  to delete')
      res.redirect('/benefit')
    }
  }
}
