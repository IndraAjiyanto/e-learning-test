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
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('icon', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1000,
    maxWidth: 2000,
    minHeight: 1000,
    maxHeight: 2000,
    folder: 'category',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async create(
    @Body() createCategoriesDto: CreateCategoriesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createCategoriesDto.icon = req.body.uploadedImageUrls?.[0];
      await this.categoriesService.create(createCategoriesDto);
      req.flash('success', 'category successfully created');
      res.redirect('/category');
    } catch (error: any) {
      req.flash('error', error.message || 'category failed to create');
      res.redirect('/category');
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const courseTypes = await this.categoriesService.findCourseTypes();
    res.render('super_admin/category/create', { user: req.user, courseTypes });
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const category = await this.categoriesService.findAll();
    res.render('super_admin/category/index', { user: req.user, category });
  }

  @Get('program/:categoryName')
  async program(
    @Param('categoryName') categoryName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const category = await this.categoriesService.findOneCategory(categoryName);
    const benefit_category = await this.categoriesService.findBenefitByCategory(
      category.id,
    );
    const flow_category = await this.categoriesService.findFlowByCategory(
      category.id,
    );
    const superiority = await this.categoriesService.findSuperiorityByCategory(
      category.id,
    );
    const gallery = await this.categoriesService.findGalleryByCategory(
      category.id,
    );
    const faqs = await this.categoriesService.findFaqByCategory(category.id);
    const alumni = await this.categoriesService.findAlumniByCategory(
      category.id,
    );
    const courses = await this.categoriesService.findCourseByCategory(category.id);
    if (category?.type === 'Special Program') {
      res.render('special_program', {
        category,
        user: req.user,
        courses,
        alumni,
        benefit_category,
        flow_category,
        superiority,
        faqs,
        gallery,
      });
    } else if (category?.type === 'Paid Program') {
      const portfolio =
        await this.categoriesService.findPortfolioByCategory(category.id);
      res.render('paid_program', {
        category,
        user: req.user,
        courses,
        alumni,
        portfolio,
        benefit_category,
        flow_category,
        superiority,
        faqs,
        gallery,
      });
    } else if (category?.type === 'Free Program') {
        res.render('free_program', { category, user: req.user, courses, alumni, gallery });
      
    }
  }

  @Roles('super_admin')
  @Get('benefit/:categoryId')
  async findBenefitByCategory(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
  ) {
    const benefit_category =
      await this.categoriesService.findBenefitByCategory(categoryId);
    res.json(benefit_category);
  }

  @Roles('super_admin')
  @Get('flow/:categoryId')
  async findFlowByCategory(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
  ) {
    const flow_category =
      await this.categoriesService.findFlowByCategory(categoryId);
    res.json(flow_category);
  }

  @Roles('super_admin')
  @Get('superiority/:categoryId')
  async findSuperiorityByCategory(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
  ) {
    const superiority =
      await this.categoriesService.findSuperiorityByCategory(categoryId);
    res.json(superiority);
  }

  @Roles('super_admin')
  @Get('faq/:categoryId')
  async findFaqByCategory(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
  ) {
    const faqs = await this.categoriesService.findFaqByCategory(categoryId);
    res.json(faqs);
  }

  @Roles('super_admin')
  @Get('admin/program/:categoryId')
  async findCourseByCategory(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
  ) {
    const courses =
      await this.categoriesService.findCourseByCategoryAll(categoryId);
    res.json(courses);
  }

  @Roles('super_admin')
  @Get('alumni/:categoryId')
  async findAlumniByCategory(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
  ) {
    const alumni =
      await this.categoriesService.findAlumniByCategory(categoryId);
    res.json(alumni);
  }

  @Roles('super_admin')
  @Get(':categoryId')
  async findOne(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const category = await this.categoriesService.findOne(categoryId);

    res.render('super_admin/category/detail', {
      user: req.user,
      category,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:categoryId')
  async formEdit(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const category = await this.categoriesService.findOne(categoryId);
    const courseTypes = await this.categoriesService.findCourseTypes();
    res.render('super_admin/category/edit', {
      user: req.user,
      category,
      courseTypes,
    });
  }

  @Roles('super_admin')
  @Patch(':categoryId')
  @UseInterceptors(
    FileInterceptor('icon', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1000,
    maxWidth: 2000,
    minHeight: 1000,
    maxHeight: 2000,
    folder: 'category',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async update(
    @Param('categoryId') categoryId: number,
    @Body() updateCategoriesDto: UpdateCategoriesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const category = await this.categoriesService.findOne(categoryId);
      if (req.body.uploadedImageUrls) {
        await this.categoriesService.deleteFile(category.icon);
        updateCategoriesDto.icon = req.body.uploadedImageUrls?.[0];
      }
      await this.categoriesService.update(categoryId, updateCategoriesDto);
      req.flash('success', 'category successfully updated');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      console.log(error);
      req.flash('error', error.message || 'category failed to update');
      res.redirect('/category/' + categoryId);
    }
  }

  @Roles('super_admin')
  @Delete(':categoryId')
  async remove(
    @Param('categoryId') categoryId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const category = await this.categoriesService.findOne(categoryId);
      await this.categoriesService.deleteFile(category.icon);
      await this.categoriesService.remove(categoryId);
      req.flash('success', 'category successfully deleted');
      res.redirect('/category');
    } catch (error: any) {
      req.flash('success', 'category failed to delete');
      res.redirect('/category');
    }
  }
}
