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
  constructor(private readonly faqsService: FaqsService) {}

  @Roles('super_admin')
  @Post(':categoryId')
  async create(
    @Param('categoryId') categoryId: number,
    @Body() createFaqDto: CreateFaqsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createFaqDto.categoryId = categoryId;
      await this.faqsService.create(createFaqDto);
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
  @Get('formEdit/:faqsId')
  async formEdit(
    @Param('faqsId') faqsId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const faqs =
      await this.faqsService.findOne(faqsId);
    res.render('super_admin/faqs/edit', {
      user: req.user,
      faqs,
    });
  }

  @Roles('super_admin')
  @Patch(':faqsId/:categoryId')
  async update(
    @Param('faqsId') faqsId: number,
    @Param('categoryId') categoryId: number,
    @Body() updateFaqDto: UpdateFaqsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.faqsService.update(
        faqsId,
        updateFaqDto,
      );
      req.flash('success', 'FAQ successfully updated');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to update');
      res.redirect('/category/' + categoryId);
    }
  }

  @Roles('super_admin')
  @Delete(':faqsId/:categoryId')
  async remove(
    @Param('faqsId') faqsId: number,
    @Param('categoryId') categoryId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.faqsService.remove(faqsId);
      req.flash('success', 'FAQ successfully deleted');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to delete');
      res.redirect('/category/' + categoryId);
    }
  }
}
