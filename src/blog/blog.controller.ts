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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfigMemory, multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import * as cheerio from 'cheerio';
import editorjsHTML from "src/common/public/js/edjs";

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
    const topics = await this.blogService.getAllTopics();
    const notSidebar = true;
    res.render('super_admin/blog/create', {
      user: req.user,
      categories,
      topics,
      notSidebar
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
    const notSidebar = true;  
    res.render('super_admin/blog/detail', {
      user: req.user,
      blog,
      notSidebar
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const blog = await this.blogService.findOne(id);
    const categories = await this.blogService.getAllCategories();
    const topics = await this.blogService.getAllTopics();
    const notSidebar = true;
    res.render('super_admin/blog/edit', {
      user: req.user,
      blog,
      categories,
      topics,
      notSidebar
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
    folder: 'blog',
  })
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {

      const editorjsData = await this.blogService.ChangeImageEditorJS(createBlogDto.isi, "/asset/blog/temp", "/asset/blog/isi", "/asset/blog/temp");

createBlogDto.isi_editorjs = editorjsData;

createBlogDto.gambar = req.body.uploadedImageUrls || [];

let html = editorjsHTML.parse(JSON.parse(editorjsData));

createBlogDto.isi = html;

      await this.blogService.create(createBlogDto);
      req.flash('success', 'Blog successfully created');
      res.redirect('/blog');
    } catch (error) {
      req.flash('error', error.message || 'Blog failed to create');
      res.redirect('/blog');
    }
  }

  @Roles('super_admin')
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'blog/temp',
    skipTransformation: true,
  })
    async uploadImage(
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
          const imageUrl = req.body.uploadedImageUrls?.[0];
    res.json({ success: 1, file:{ url: imageUrl }}); 
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
    folder: 'blog',
  })
  async update(
    @Param('id') id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const blog = await this.blogService.findOne(id);
      if(updateBlogDto.isi) {
      await this.blogService.ChangeImageEditorJS(blog.isi_editorjs, "/asset/blog/isi", "/asset/blog/temp");
        updateBlogDto.isi_editorjs = await this.blogService.ChangeImageEditorJS(updateBlogDto.isi, "/asset/blog/temp", "/asset/blog/isi", "/asset/blog/temp");
  updateBlogDto.isi = editorjsHTML.parse(JSON.parse(updateBlogDto.isi_editorjs));
}

      updateBlogDto.gambar = updateBlogDto.gambar || [];
      const combineImage = [...updateBlogDto.gambar || [], ...(req.body.uploadedImageUrls) || []];
      const newImageUrls = await this.blogService.deleteUnusedImages(blog.gambar, combineImage);

      updateBlogDto.gambar = newImageUrls;

      await this.blogService.update(id, updateBlogDto);
      req.flash('success', 'Blog successfully updated');
      res.redirect('/blog');
    } catch (error) {
      req.flash('error', error.message || 'Blog failed to update');
      res.redirect('/blog');
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
      const blog = await this.blogService.findOne(id);
      if (!blog) {
        req.flash('error', 'Blog not found');
        res.redirect('/blog');
      }
      if (blog.gambar && blog.gambar.length > 0) {
        for (const url of blog.gambar) {
          await this.blogService.deleteFile(url);
        }
      }
if (blog.isi) {
  const $ = cheerio.load(blog.isi);
  const imgUrls = $('img')
    .toArray()                
    .map(img => $(img).attr('src')) 
    .filter(src => !!src); 

  await Promise.all(
    imgUrls.map(url => this.blogService.deleteFile(url!))
  );
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
