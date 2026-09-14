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
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { flashToast } from 'src/common/utils/toast.util';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createFaqDto: CreateFaqDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.faqService.create(createFaqDto);
      flashToast(req, 'FAQ Created', 'The FAQ has been added successfully');
      res.redirect('/faq');
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to created');
      res.redirect('/faq');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const faq = await this.faqService.findAll();
    res.render('super_admin/faq/index', {
      user: req.user,
      faq,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Req() req: Request, @Res() res: Response) {
    res.render('super_admin/faq/create', {
      user: req.user,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:faqId')
  async formEdit(
    @Param('faqId') faqId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const faq = await this.faqService.findOne(faqId);
    res.render('super_admin/faq/edit', {
      user: req.user,
      faq,
    });
  }

  @Roles('super_admin')
  @Patch(':faqId')
  async update(
    @Param('faqId') faqId: string,
    @Body() updateFaqDto: UpdateFaqDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.faqService.update(faqId, updateFaqDto);
      flashToast(req, 'Changes Saved', 'The FAQ has been updated successfully.');
      res.redirect('/faq');
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to update');
      res.redirect('/faq');
    }
  }

  @Roles('super_admin')
  @Delete(':faqId')
  async remove(
    @Param('faqId') faqId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.faqService.remove(faqId);
      flashToast(req, 'FAQ Deleted', 'The FAQ has been removed successfully.');
      res.redirect('/faq');
    } catch (error: any) {
      req.flash('error', error.message || 'FAQ failed to delete');
      res.redirect('/faq');
    }
  }
}
