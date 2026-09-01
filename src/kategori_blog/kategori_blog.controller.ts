import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { KategoriBlogService } from './kategori_blog.service';
import { CreateKategoriBlogDto } from './dto/create-kategori_blog.dto';
import { UpdateKategoriBlogDto } from './dto/update-kategori_blog.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@UseGuards(AuthenticatedGuard)
@Controller('category-blog')
export class KategoriBlogController {
  constructor(private readonly kategoriBlogService: KategoriBlogService) {}

  @Roles('super_admin')
  @Get('')
  async adminList(@Res() res: Response, @Req() req: Request) {
    const kategori_blog = await this.kategoriBlogService.findAll();
    res.render('super_admin/kategori_blog/index', {
      user: req.user,
      kategori_blog,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/kategori_blog/create', {
      user: req.user,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kategori_blog = await this.kategoriBlogService.findOne(id);
    res.render('super_admin/kategori_blog/edit', {
      user: req.user,
      kategori_blog,
    });
  }

  @Roles('super_admin')
  @Post('')
  async create(
    @Body() createKategoriBlogDto: CreateKategoriBlogDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.kategoriBlogService.create(createKategoriBlogDto);
      req.flash('success', 'Blog Category successfully created');
      res.redirect('/category-blog');
    } catch (error: any) {
      req.flash('error', error.message || 'Blog Category failed to create');
      res.redirect('/category-blog');
    }
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateKategoriBlogDto: UpdateKategoriBlogDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.kategoriBlogService.update(id, updateKategoriBlogDto);
      req.flash('success', 'Blog Category successfully updated');
      res.redirect('/category-blog');
    } catch (error: any) {
      req.flash('error', error.message || 'Blog Category failed to update');
      res.redirect('/category-blog');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kategori = await this.kategoriBlogService.findOne(id);
      if (!kategori) {
        req.flash('error', 'Blog Category not found');
        res.redirect('/category-blog');
      }
      await this.kategoriBlogService.remove(id);
      req.flash('success', 'Blog Category successfully removed');
      res.redirect('/category-blog');
    } catch (error: any) {
      req.flash('error', error.message || 'Blog Category failed to remove');
      res.redirect('/category-blog');
    }
  }
}
