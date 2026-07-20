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
} from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqsDto } from './dto/create-faqs.dto';
import { UpdateFaqsDto } from './dto/update-faqs.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('question-general')
export class FaqsController {
  constructor(private readonly pertanyaanUmumService: FaqsService) {}

  @Roles('super_admin')
  @Post(':categoryId')
  async create(
    @Param('categoryId') categoryId: number,
    @Body() createPertanyaanUmumDto: CreateFaqsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPertanyaanUmumDto.categoryId = categoryId;
      await this.pertanyaanUmumService.create(createPertanyaanUmumDto);
      req.flash('success', 'FAQ successfully created');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to created');
      res.redirect('/category/' + categoryId);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:categoryId')
  async formCreate(
    @Param('categoryId') categoryId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('super_admin/faqs/create', {
      user: req.user,
      categoryId,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:pertanyaan_umumId')
  async formEdit(
    @Param('pertanyaan_umumId') pertanyaan_umumId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const faqs =
      await this.pertanyaanUmumService.findOne(pertanyaan_umumId);
    res.render('super_admin/faqs/edit', {
      user: req.user,
      faqs,
    });
  }

  @Roles('super_admin')
  @Patch(':pertanyaan_umumId/:categoryId')
  async update(
    @Param('pertanyaan_umumId') pertanyaan_umumId: number,
    @Param('categoryId') categoryId: number,
    @Body() updatePertanyaanUmumDto: UpdateFaqsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.pertanyaanUmumService.update(
        pertanyaan_umumId,
        updatePertanyaanUmumDto,
      );
      req.flash('success', 'FAQ successfully updated');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to update');
      res.redirect('/category/' + categoryId);
    }
  }

  @Roles('super_admin')
  @Delete(':pertanyaan_umumId/:categoryId')
  async remove(
    @Param('pertanyaan_umumId') pertanyaan_umumId: number,
    @Param('categoryId') categoryId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.pertanyaanUmumService.remove(pertanyaan_umumId);
      req.flash('success', 'FAQ successfully deleted');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to delete');
      res.redirect('/category/' + categoryId);
    }
  }
}
