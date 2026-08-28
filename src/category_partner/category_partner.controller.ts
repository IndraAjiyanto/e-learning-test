import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { CategoryPartnerService } from './category_partner.service';
import { CreateCategoryPartnerDto } from './dto/create-category_partner.dto';
import { UpdateCategoryPartnerDto } from './dto/update-category_partner.dto';

@UseGuards(AuthenticatedGuard)
@Controller('category-partner')
export class CategoryPartnerController {
  constructor(
    private readonly categoryPartnerService: CategoryPartnerService,
  ) {}

  @Roles('super_admin')
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const categories = await this.categoryPartnerService.findAll();

    res.render('super_admin/category_partner/index', {
      user: req.user,
      categories,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Req() req: Request, @Res() res: Response) {
    res.render('super_admin/category_partner/create', {
      user: req.user,
    });
  }

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createCategoryPartnerDto: CreateCategoryPartnerDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.categoryPartnerService.create(createCategoryPartnerDto);

      req.flash('success', 'Category partner successfully created');

      return res.redirect('/category-partner');
    } catch (error: any) {
      req.flash('error', error.message || 'Category partner failed to create');

      return res.redirect('/category-partner');
    }
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const category = await this.categoryPartnerService.findOne(id);

    res.render('super_admin/category_partner/edit', {
      user: req.user,
      category,
    });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryPartnerDto: UpdateCategoryPartnerDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.categoryPartnerService.update(id, updateCategoryPartnerDto);

      req.flash('success', 'Category partner successfully updated');

      return res.redirect('/category-partner');
    } catch (error: any) {
      req.flash('error', error.message || 'Category partner failed to update');

      return res.redirect('/category-partner');
    }
  }

  @Roles('super_admin')
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const category = await this.categoryPartnerService.findOne(id);

    res.render('super_admin/category_partner/detail', {
      user: req.user,
      category,
    });
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.categoryPartnerService.remove(id);

      req.flash('success', 'Category partner successfully removed');

      return res.redirect('/category-partner');
    } catch (error: any) {
      req.flash('error', error.message || 'Category partner failed to remove');

      return res.redirect('/category-partner');
    }
  }
}
