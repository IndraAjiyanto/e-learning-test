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
import {
  multerConfigMemory,
  multerConfigMemoryOnly,
} from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import * as cheerio from 'cheerio';
import editorjsHTML from 'src/common/public/js/edjs';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('detail/:id')
  async viewBlogDetail(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if(req.user){
      const userLike = await this.blogService.userLike(req.user.id, id)
          const blog = await this.blogService.findOne(id);
    res.render('blog-detail', { blog, user: req.user, userLike });
    }else{
    const blog = await this.blogService.findOne(id);
    res.render('blog-detail', { blog, user: req.user });
    }
  }

  @Post('view/:id')
  async incrementViews(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    await this.blogService.incrementViews(id);
    return res.json({ success: true });
  }

  @Post('like/:id')
  async likeBlog(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if(req.user){
    await this.blogService.incrementLikes(id, req.user.id);
    const userLike = await this.blogService.userLike(req.user.id, id);
    const countLike = await this.blogService.countLikes(id);
    return res.json({ userLike: userLike.length, countLike: countLike });
    }else{
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  @Post('comment/:id')
  async commentBlog(
    @Param('id') id: number,
    @Body('content') content: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await this.blogService.addComment(id, req.user.id, content);
     return res.json({ success: true });
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
      notSidebar,
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
    res.render('blog-detail', {
      user: req.user,
      blog,
      notSidebar,
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
      notSidebar,
    });
  }

  @Get('reply/:comentId')
  async getReply(@Param('comentId') comentId: number, @Res() res:Response, @Req() req:Request){
    const result = await this.blogService.getReply(comentId)
     return res.json({ success: true, reply: result });
  }

  @Post('reply/create/:comentId/:blogId')
  async createreply(
    @Param('comentId') comentId: number,
    @Param('blogId') blogId: number,
    @Body('content') content: string,
    @Res() res: Response,
    @Req() req:  Request
  ){
        if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await this.blogService.createReply(comentId, req.user.id, blogId, content)
     return res.json({ success: true });


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
    createBlogDto.isi_editorjs = createBlogDto.isi_editorjs || {};
    try {
      const editorjsDataId = await this.blogService.ChangeImageEditorJS(
        createBlogDto.isi['id'],
        '/asset/blog/temp',
        '/asset/blog/isi',
      );
      const editorjsDataEn = await this.blogService.ChangeImageEditorJS(
        createBlogDto.isi['en'],
        '/asset/blog/temp',
        '/asset/blog/isi',
      );
      const editorjsDataJp = await this.blogService.ChangeImageEditorJS(
        createBlogDto.isi['ja'],
        '/asset/blog/temp',
        '/asset/blog/isi',
      );

      await this.blogService.deleteFileTemp('/asset/blog/temp');

      createBlogDto.isi_editorjs['id'] = editorjsDataId;
      createBlogDto.isi_editorjs['en'] = editorjsDataEn;
      createBlogDto.isi_editorjs['ja'] = editorjsDataJp;
      createBlogDto.gambar = req.body.uploadedImageUrls || [];
      let htmlId = editorjsHTML.parse(JSON.parse(editorjsDataId));
      let htmlEn = editorjsHTML.parse(JSON.parse(editorjsDataEn));
      let htmlJp = editorjsHTML.parse(JSON.parse(editorjsDataJp));

      createBlogDto.isi['id'] = htmlId;
      createBlogDto.isi['en'] = htmlEn;
      createBlogDto.isi['ja'] = htmlJp;

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
  async uploadImage(@Res() res: Response, @Req() req: Request) {
    try {
      const imageUrl = req.body.uploadedImageUrls?.[0];
      res.json({ success: 1, file: { url: imageUrl } });
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
    updateBlogDto.isi_editorjs = updateBlogDto.isi_editorjs! || {};
    try {
      const blog = await this.blogService.findOne(id);
if (updateBlogDto.isi) {
// Proses bahasa ID
if (updateBlogDto.isi['id']) {
  await this.blogService.ChangeImageEditorJS(
    blog.isi_editorjs['id'],
    '/asset/blog/isi',
    '/asset/blog/temp',
  );

  updateBlogDto.isi_editorjs['id'] = await this.blogService.ChangeImageEditorJS(
    updateBlogDto.isi['id'],
    '/asset/blog/temp',
    '/asset/blog/isi',
  );

  updateBlogDto.isi['id'] = editorjsHTML.parse(
    JSON.parse(updateBlogDto.isi_editorjs['id']),
  );
}

// Proses bahasa EN
if (updateBlogDto.isi['en']) {
  await this.blogService.ChangeImageEditorJS(
    blog.isi_editorjs['en'],
    '/asset/blog/isi',
    '/asset/blog/temp',
  );

  updateBlogDto.isi_editorjs['en'] = await this.blogService.ChangeImageEditorJS(
    updateBlogDto.isi['en'],
    '/asset/blog/temp',
    '/asset/blog/isi',
  );

  updateBlogDto.isi['en'] = editorjsHTML.parse(
    JSON.parse(updateBlogDto.isi_editorjs['en']),
  );
}

// Proses bahasa JP
if (updateBlogDto.isi['ja']) {
  await this.blogService.ChangeImageEditorJS(
    blog.isi_editorjs['ja'],
    '/asset/blog/isi',
    '/asset/blog/temp',
  );

  updateBlogDto.isi_editorjs['ja'] = await this.blogService.ChangeImageEditorJS(
    updateBlogDto.isi['ja'],
    '/asset/blog/temp',
    '/asset/blog/isi',
  );

  updateBlogDto.isi['ja'] = editorjsHTML.parse(
    JSON.parse(updateBlogDto.isi_editorjs['ja']),
  );
}
      await this.blogService.deleteFileTemp('/asset/blog/temp');

}


      updateBlogDto.gambar = updateBlogDto.gambar || [];
      const combineImage = [
        ...(updateBlogDto.gambar || []),
        ...(req.body.uploadedImageUrls || []),
      ];
      const newImageUrls = await this.blogService.deleteUnusedImages(
        blog.gambar,
        combineImage,
      );

      updateBlogDto.gambar = newImageUrls;

      await this.blogService.update(id, updateBlogDto);
      req.flash('success', 'Blog successfully updated');
      res.redirect('/blog');
    } catch (error) {
      req.flash('error', error.message || 'Blog failed to update');
      res.redirect('/blog');
    }
  }

  @Patch('coment/:id')
  async editComent(
    @Param('id') id:number,
    @Body('content') content: string,
    @Res() res: Response,
    @Req() req: Request
   ){
    if(req.user){
          const result = await this.blogService.editComment(id, content, req.user.id);
    return res.json({ success: true, data: result });
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
await Promise.all(
  ['id', 'en', 'ja'].flatMap((lang) => {
    const $ = cheerio.load(blog.isi[lang]);
    return $('img')
      .toArray()
      .map((img) => $(img).attr('src'))
      .filter((src): src is string => !!src)
      .map((url) => this.blogService.deleteFile(url));
  }),
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

  @Delete('comment/:id')
  async deleteComment(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.blogService.deleteComment(id);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}