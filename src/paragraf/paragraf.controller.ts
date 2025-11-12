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
import { ParagrafService } from './paragraf.service';
import { CreateParagrafDto } from './dto/create-paragraf.dto';
import { UpdateParagrafDto } from './dto/update-paragraf.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('paragraf')
export class ParagrafController {
  constructor(private readonly paragrafService: ParagrafService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createParagrafDto: CreateParagrafDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createParagrafDto.p_ke = await this.paragrafService.noPertemuan();
      await this.paragrafService.create(createParagrafDto);
      req.flash('success', 'paragraph succesfuly create');
      res.redirect('/paragraf');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to create paragraph');
      res.redirect('/paragraf');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const paragraf = await this.paragrafService.findAll();
    res.render('super_admin/paragraf/index', { user: req.user, paragraf });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/paragraf/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const paragraf = await this.paragrafService.findOne(id);
    res.render('super_admin/paragraf/edit', { user: req.user, paragraf });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateParagrafDto: UpdateParagrafDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.paragrafService.update(id, updateParagrafDto);
      req.flash('success', 'paragraph succesfuly update');
      res.redirect('/paragraf');
    } catch (error) {
      req.flash('error', 'Failed to update paragraph');
      res.redirect('/paragraf');
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
      await this.paragrafService.remove(id);
      req.flash('success', 'paragraph succesfuly delete');
      res.redirect('/paragraf');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to delete paragraph');
      res.redirect('/paragraf');
    }
  }
}
