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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':categoryId')
  async findAll(@Req() req: Request, @Res() res: Response, @Param('categoryId') categoryId: number) {
    const category = await this.categoryService.findOne(categoryId);
    if(category.type === 'Special Program') {
    const kelas = await this.categoryService.findAll(categoryId);
    const benefit = await this.categoryService.findBenefit(categoryId);
    const jenis_kelas = await this.categoryService.findJenisKelas();
    const alumni = await this.categoryService.findAlumni(categoryId);
    const faq = await this.categoryService.findFaq(categoryId);
    res.render('category', { benefit, kelas, jenis_kelas, alumni, faq, user: req.user });
    }else{
    const kelas = await this.categoryService.findAll(categoryId);
    const jenis_kelas = await this.categoryService.findJenisKelas();
    const benefit = await this.categoryService.findBenefit(categoryId);
    const alumni = await this.categoryService.findAlumni(categoryId);
    const faq = await this.categoryService.findFaq(categoryId);
    res.render('category', { kelas, jenis_kelas, benefit, alumni, faq, user: req.user, category});
    }

  }
}
