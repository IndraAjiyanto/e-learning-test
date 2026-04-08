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
@Controller('portfolios')
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
    } catch (error) {
      req.flash('error', error.message || 'Portfolio failed to create');
      res.redirect('/portfolios');
    }
  }

  @Roles('user')
  @Post('create/:kelasId')
  @UseInterceptors(
    FilesInterceptor('gambar', 100, multerConfigMemoryOnly),
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
    @Param('kelasId') kelasId: number,
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const editorjsData = await this.portfoliosService.ChangeImageEditorJS(
        createPortfolioDto.content,
        '/asset/portfolio/temp',
        '/asset/portfolio/isi',
        '/asset/portfolio/temp',
      );

      createPortfolioDto.content = editorjsData;

      let html = editorjsHTML.parse(JSON.parse(editorjsData));

      createPortfolioDto.content_html = html;

      createPortfolioDto.kelasId = kelasId;
      createPortfolioDto.gambar = req.body.uploadedImageUrls;
      if (req.user) {
        createPortfolioDto.userId = req.user.id;
      }
      await this.portfoliosService.create(createPortfolioDto);
      req.flash('success', 'portofolio successfully upload');
      res.redirect(`/kelass/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Failed to upload portofolio');
      res.redirect(`/kelass/${kelasId}`);
    }
  }

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const portfolio = await this.portfoliosService.findAll();
    const kategori = await this.portfoliosService.findKategori();
    const jenis_kelas = await this.portfoliosService.findJenisKelas();
    res.render('portfolio', {
      user: req.user,
      portfolio,
      kategori,
      jenis_kelas,
    });
  }

  @Roles('user')
  @Get('myportfolio/:userId')
  async myPortfolio(
    @Req() req: Request,
    @Res() res: Response,
    @Param('userId') userId: number,
  ) {
    const kategori = await this.portfoliosService.findKategoriMyPortfolio(userId);
    const jenis_kelas = await this.portfoliosService.findJenisKelasMyPortfolio(userId);
    const portfolio = await this.portfoliosService.findByUser(userId);
    res.render('user/myportfolio', {
      user: req.user,
      portfolio,
      kategori,
      jenis_kelas,
    });
  }

  @Roles('user')
  @Get('formCreate/:kelasId')
  async formCreate(
    @Param('kelasId') kelasId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('user/portofolio/create', { user: req.user, kelasId });
  }

  @Roles('user')
  @Get(':portofolioId/:kelasId')
  async findOne(
    @Param('portofolioId') portofolioId: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const portfolio = await this.portfoliosService.findOne(portofolioId);
    res.render('user/portofolio/detail', { user: req.user, portfolio, kelasId });
  }

  @Roles('user')
  @Get('formEdit/:portfolioId/:kelasId')
  async formEdit(
    @Param('portfolioId') portfolioId: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const portfolio = await this.portfoliosService.findOne(portfolioId);
    res.render('user/portofolio/edit', { user: req.user, portfolio, kelasId });
  }

  @Roles('user')
  @Patch(':portfolioId/:kelasId')
  @UseInterceptors(
    FilesInterceptor('gambar', 10, multerConfigMemoryOnly),
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
    @Param('kelasId') kelasId: number,
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
        updatePortfolioDto.content_html = editorjsHTML.parse(
          JSON.parse(updatePortfolioDto.content),
        );
      }

      updatePortfolioDto.gambar = updatePortfolioDto.gambar || [];
      const combineImage = [
        ...(updatePortfolioDto.gambar || []),
        ...(req.body.uploadedImageUrls || []),
      ];
      const newImageUrls = await this.portfoliosService.deleteUnusedImages(
        oldPortfolio.gambar,
        combineImage,
      );

      const updateData = {
        judul: updatePortfolioDto.judul,
        deskripsi: updatePortfolioDto.deskripsi,
        teknologi: updatePortfolioDto.teknologi,
        gambar: newImageUrls,
        content: updatePortfolioDto.content,
        content_html: updatePortfolioDto.content_html,
      };

      await this.portfoliosService.update(portfolioId, updateData);

      req.flash('success', 'Portfolio successfully updated');
      return res.redirect(`/portfolios/${portfolioId}/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Portfolio failed to update');
      return res.redirect(`/portfolios/${portfolioId}/${kelasId}`);
    }
  }

  @Roles('user')
  @Delete(':portfolioId/:kelasId')
  async remove(
    @Param('portfolioId') portfolioId: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const portfolio = await this.portfoliosService.findOne(portfolioId);
      if (portfolio) {
        for (const imageUrl of portfolio.gambar) {
          await this.portfoliosService.deleteFile(imageUrl);
        }
        await this.portfoliosService.remove(portfolioId);
      }
      req.flash('success', 'Portfolio successfully deleted');
      res.redirect(`/kelass/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Failed to delete portfolio');
      res.redirect(`/kelass/${kelasId}`);
    }
  }
}
