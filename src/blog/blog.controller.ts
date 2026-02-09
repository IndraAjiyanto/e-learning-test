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
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfigMemory } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('detail/:id')
  async viewBlogDetail(@Param('id') id: number, @Res() res: Response, @Req() req: Request) {
    const blog = await this.blogService.findOne(id);
    res.render('blog-detail', {blog, user: req.user});
  }

  @Roles('super_admin')
  @Get('')
  async findAll(@Res() res: Response, @Req() req: Request) {
    const blogs = await this.blogService.findAll();
    res.render('super_admin/blog/index', {
      user: req.user,
      blogs,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const categories = await this.blogService.getAllCategories();
    res.render('super_admin/blog/create', {
      user: req.user,
      categories,
    });
  }

  @Roles('super_admin')
  @Get(':id')
  async adminList(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    const blog = await this.blogService.findOne(id);
    res.render('super_admin/blog/detail', {
      user: req.user,
      blog,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const blog = await this.blogService.findOne(+id);
    const categories = await this.blogService.getAllCategories();
    res.render('super_admin/blog/edit', {
      user: req.user,
      blog,
      categories,
    });
  }

  @Roles('super_admin')
  @Post('')
  @UseInterceptors(
    FilesInterceptor('gambar', 10, multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 800,
    maxWidth: 1920,
    minHeight: 400,
    maxHeight: 1080,
    maxSize: 3 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/blog',
  })
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createBlogDto.gambar = req.body.uploadedImageUrls || [];
      await this.blogService.create(createBlogDto);
      req.flash('success', 'Blog successfully created');
      res.redirect('/blog');
    } catch (error) {
      req.flash('error', error.message || 'Blog failed to create');
      res.redirect('/blog');
    }
  }

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('gambar', 10, multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 800,
    maxWidth: 1920,
    minHeight: 400,
    maxHeight: 1080,
    maxSize: 3 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/blog',
  })
  async update(
    @Param('id') id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const blog = await this.blogService.findOne(+id);

      let existingImages: string[] = [];
      if (req.body.existing_images) {
        existingImages = Array.isArray(req.body.existing_images)
          ? req.body.existing_images
          : [req.body.existing_images];
      }

      if (blog.gambar && blog.gambar.length > 0) {
        for (const url of blog.gambar) {
          if (!existingImages.includes(url)) {
            await this.blogService.getPublicIdFromUrl(url);
          }
        }
      }

      const newUploadedImages = req.body.uploadedImageUrls || [];
      updateBlogDto.gambar = [...existingImages, ...newUploadedImages];

      await this.blogService.update(id, updateBlogDto);
      req.flash('success', 'Blog successfully updated');
      res.redirect('/blog');
    } catch (error) {
      req.flash('error', error.message || 'Blog failed to update');
      res.redirect('/blog');
    }
  }

  @Roles('super_admin')
  @Delete('admin/delete/:id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const blog = await this.blogService.findOne(id);
      if (!blog) {
        req.flash('error', 'Blog not found');
        res.redirect('/blog');
      }
      if (blog.gambar && blog.gambar.length > 0) {
        for (const url of blog.gambar) {
          await this.blogService.getPublicIdFromUrl(url);
        }
      }
      await this.blogService.remove(id);
      req.flash('success', 'Blog successfully removed');
      res.redirect('/blog');
    } catch (error) {
      req.flash('error', error.message || 'Blog failed to remove');
      res.redirect('/blog');
    }
  }
}
