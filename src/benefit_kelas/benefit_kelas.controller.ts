import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BenefitKelasService } from './benefit_kelas.service';
import { CreateBenefitKelaDto } from './dto/create-benefit_kela.dto';
import { UpdateBenefitKelaDto } from './dto/update-benefit_kela.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('benefit-kelas')
export class BenefitKelasController {
  constructor(private readonly benefitKelasService: BenefitKelasService) {}

  @Roles('super_admin')
  @Post(':kategoriId')
    @UseInterceptors(FileInterceptor('icon', multerConfigImage))
  async create(@Param('kategoriId') kategoriId: number,@UploadedFile() icon: Express.Multer.File, @Body() createBenefitKelaDto: CreateBenefitKelaDto, @Res() res:Response, @Req() req:Request) {
    try {
      createBenefitKelaDto.icon = icon.path
      createBenefitKelaDto.kategoriId = kategoriId
    await this.benefitKelasService.create(createBenefitKelaDto);
    req.flash('success', 'benefit kelas successfully created')
    res.redirect(`/kategoris/${kategoriId}`)
    } catch (error) {
         req.flash('error', 'benefit kelas failed to create')
    res.redirect(`/kategoris/${kategoriId}`)
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:kategoriId')
  async formCreate(@Res() res:Response, @Req() req:Request, @Param('kategoriId') kategoriId: number){
    res.render('super_admin/benefit_kelas/create', {user: req.user, kategoriId})
  }

  @Roles('super_admin')
  @Get('formEdit/:benefitKelasId')
  async formEdit(@Param('benefitKelasId') benefitKelasId: number, @Res() res:Response, @Req() req:Request) {
    const benefit_kelas = await this.benefitKelasService.findOne(benefitKelasId)
    res.render('super_admin/benefit_kelas/edit', {user: req.user, benefit_kelas})
  }

  @Roles('super_admin')
  @Patch(':benefitKelasId/:kategoriId')
    @UseInterceptors(FileInterceptor('icon', multerConfigImage))
  async update(@Param('benefitKelasId') benefitKelasId: number, @Param('kategoriId') kategoriId: number, @Body() updateBenefitKelaDto: UpdateBenefitKelaDto,@UploadedFile() icon: Express.Multer.File, @Res() res:Response, @Req() req:Request) {
    try {
      const benefit_kelas = await this.benefitKelasService.findOne(benefitKelasId)
      if(icon){
        updateBenefitKelaDto.icon = icon.path
        await this.benefitKelasService.getPublicIdFromUrl(benefit_kelas.icon)
      }
    await this.benefitKelasService.update(benefitKelasId, updateBenefitKelaDto);
    req.flash('success', 'benefit kelas successfully update')
    res.redirect(`/kategoris/${kategoriId}`)
    } catch (error) {
          req.flash('error', 'benefit kelas failed to update')
    res.redirect(`/kategoris/${kategoriId}`)
    }
  }

  @Roles('super_admin')
  @Delete(':benefitKelasId/:kategoriId')
  async remove(@Param('benefitKelasId') benefitKelasId: number, @Param('kategoriId') kategoriId: number, @Res() res:Response, @Req() req:Request) {
    try {
      const benefit_kelas = await this.benefitKelasService.findOne(benefitKelasId)
      if(!benefit_kelas){
        req.flash('error', 'benefit kelas not found')
      }
      await this.benefitKelasService.getPublicIdFromUrl(benefit_kelas.icon)
    await this.benefitKelasService.remove(benefitKelasId);
    req.flash('success', 'benefit kelas successfully delete')
    res.redirect(`/kategoris/${kategoriId}`)
    } catch (error) {
          req.flash('error', 'benefit kelas failed to delete')
    res.redirect(`/kategoris/${kategoriId}`)
    }
  }
}
