import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ParagraphsService } from './paragraphs.service';
import { CreateParagraphsDto } from './dto/create-paragraphs.dto';
import { UpdateParagraphsDto } from './dto/update-paragraphs.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('paragraphs')
export class ParagraphsController {
  constructor(private readonly paragraphsService: ParagraphsService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createParagraphsDto: CreateParagraphsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createParagraphsDto.p_ke = await this.paragraphsService.noPertemuan();
      await this.paragraphsService.create(createParagraphsDto);
      req.flash('success', 'paragraph succesfuly create');
      res.redirect('/paragraphs');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create paragraph');
      res.redirect('/paragraphs');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const paragraphs = await this.paragraphsService.findAll();
    res.render('super_admin/paragraphs/index', { user: req.user, paragraphs });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/paragraphs/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const paragraphs = await this.paragraphsService.findOne(id);
    res.render('super_admin/paragraphs/edit', { user: req.user, paragraphs });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateParagraphsDto: UpdateParagraphsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.paragraphsService.update(id, updateParagraphsDto);
      req.flash('success', 'paragraph succesfuly update');
      res.redirect('/paragraphs');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update paragraph');
      res.redirect('/paragraphs');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.paragraphsService.remove(id);
      req.flash('success', 'paragraph succesfuly delete');
      res.redirect('/paragraphs');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete paragraph');
      res.redirect('/paragraphs');
    }
  }
}
