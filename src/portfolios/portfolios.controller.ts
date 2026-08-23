import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import editorjsHTML from 'src/common/public/js/edjs';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('portfolio')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Roles('user')
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'portfolio/temp',
    skipTransformation: true,
  })
  async uploadImage(@Res() res: Response, @Req() req: Request) {
    try {
      const imageUrl = req.body.uploadedImageUrls?.[0];
      res.json({ success: 1, file: { url: imageUrl } });
    } catch (error: any) {
      req.flash('error', error.message || 'Portfolios failed to create');
      res.redirect('/portfolios');
    }
  }

  @Roles('user')
  @Post('create')
  @UseInterceptors(
    FilesInterceptor('image', 100, multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'portfolio',
  })
  async create(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));
    
    try {
      const editorjsData = await this.portfoliosService.ChangeImageEditorJS(
        createPortfolioDto.content,
        '/asset/portfolio/temp',
        '/asset/portfolio/isi',
        '/asset/portfolio/temp',
      );

      createPortfolioDto.content = editorjsData;

      let html = editorjsHTML.parse(JSON.parse(editorjsData));

      createPortfolioDto.contentHtml = html;

      const courseId = createPortfolioDto.courseId;
      createPortfolioDto.image = req.body.uploadedImageUrls;
      if (req.user) {
        createPortfolioDto.userId = req.user.id;
      }
      const newPortfolio = await this.portfoliosService.create(createPortfolioDto);
      
      if (isAjax) {
        return res.status(201).json({ success: true, message: 'Portfolio successfully created', data: newPortfolio });
      }

      req.flash('success', 'portofolios successfully upload');
      res.redirect(`/program/${courseId}`);
    } catch (error: any) {
      if (isAjax) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to upload portofolios' });
      }
      
      req.flash('error', error.message || 'Failed to upload portofolios');
      res.redirect(`/program/${createPortfolioDto.courseId || ''}`);
    }
  }

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const portfolio = await this.portfoliosService.findAll();
    const category = await this.portfoliosService.findCategory();
    const courseType = await this.portfoliosService.findCourseTypes();
    res.render('portfolio', {
      user: req.user,
      portfolio,
      category,
      courseType,
    });
  }

  @Roles('user')
  @Get('myportfolio/:userId')
  async myPortfolio(
    @Req() req: Request,
    @Res() res: Response,
    @Param('userId') userId: number,
  ) {
    const category = await this.portfoliosService.findCategoryMyPortfolio(userId);
    const courseType = await this.portfoliosService.findMyPortfolioCourseTypes(userId);
    // const portfolio = await this.portfoliosService.findByUser(userId);
    res.render('user/myportfolio', {
      user: req.user,
      // portfolio,
      category,
      courseType,
    });
  }

  @Roles('user')
  @Get('formCreate/:courseId')
  async formCreate(
    @Param('courseId') courseId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('user/portofolios/create', { user: req.user, courseId });
  }

  @Roles('user')
  @Get(':portofolioId/:courseId')
  async findOne(
    @Param('portofolioId') portofolioId: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const portfolio = await this.portfoliosService.findOne(portofolioId);
    res.render('user/portofolios/detail', { user: req.user, portfolio, courseId });
  }

  @Roles('user')
  @Get('formEdit/:portfolioId/:courseId')
  async formEdit(
    @Param('portfolioId') portfolioId: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const portfolio = await this.portfoliosService.findOne(portfolioId);
    res.render('user/portofolios/edit', { user: req.user, portfolio, courseId });
  }

  @Roles('user')
  @Patch(':portfolioId/:courseId')
  @UseInterceptors(
    FilesInterceptor('image', 10, multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'portfolio',
  })
  async update(
    @Param('portfolioId') portfolioId: number,
    @Param('courseId') courseId: number,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const oldPortfolio = await this.portfoliosService.findOne(portfolioId);

      if (updatePortfolioDto.content) {
        await this.portfoliosService.ChangeImageEditorJS(
          oldPortfolio.content,
          '/asset/portfolio/isi',
          '/asset/portfolio/temp',
        );
        updatePortfolioDto.content =
          await this.portfoliosService.ChangeImageEditorJS(
            updatePortfolioDto.content,
            '/asset/portfolio/temp',
            '/asset/portfolio/isi',
            '/asset/portfolio/temp',
          );
        updatePortfolioDto.contentHtml = editorjsHTML.parse(
          JSON.parse(updatePortfolioDto.content),
        );
      }

      updatePortfolioDto.image = updatePortfolioDto.image || [];
      const combineImage = [
        ...(updatePortfolioDto.image || []),
        ...(req.body.uploadedImageUrls || []),
      ];
      const newImageUrls = await this.portfoliosService.deleteUnusedImages(
        oldPortfolio.image,
        combineImage,
      );

      const updateData = {
        title: updatePortfolioDto.title,
        description: updatePortfolioDto.description,
        image: newImageUrls,
        content: updatePortfolioDto.content,
        contentHtml: updatePortfolioDto.contentHtml,
      };

      await this.portfoliosService.update(portfolioId, updateData);

      req.flash('success', 'Portfolios successfully updated');
      return res.redirect(`/portfolio/${portfolioId}/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Portfolios failed to update');
      return res.redirect(`/portfolio/${portfolioId}/${courseId}`);
    }
  }

  @Roles('user')
  @Delete(':portfolioId/:courseId')
  async remove(
    @Param('portfolioId') portfolioId: number,
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const portfolio = await this.portfoliosService.findOne(portfolioId);
      if (portfolio) {
        for (const imageUrl of portfolio.image) {
          await this.portfoliosService.deleteFile(imageUrl);
        }
        await this.portfoliosService.remove(portfolioId);
      }
      req.flash('success', 'Portfolios successfully deleted');
      res.redirect(`/program/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete portfolio');
      res.redirect(`/program/${courseId}`);
    }
  }
}
