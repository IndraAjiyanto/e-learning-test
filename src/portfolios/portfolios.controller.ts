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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import {
  multerConfigMemoryOnly,
} from 'src/common/config/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';

@UseGuards(AuthenticatedGuard)
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Roles('user')
  @Post(':kelasId')
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
    const kategori = await this.portfoliosService.findKategori();
    const jenis_kelas = await this.portfoliosService.findJenisKelas();
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
  @Get(':portofolioId')
  async findOne(
    @Param('portofolioId') portofolioId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const portfolio = await this.portfoliosService.findOne(portofolioId);
    res.render('user/portofolio/detail', { user: req.user, portfolio });
  }

  @Roles('user')
  @Get('formEdit/:portfolioId')
  async formEdit(
    @Param('portfolioId') portfolioId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const portfolio = await this.portfoliosService.findOne(portfolioId);
    res.render('user/portofolio/edit', { user: req.user, portfolio });
  }

  @Roles('user')
  @Patch(':portfolioId')
  @UseInterceptors(FilesInterceptor('gambar', 10, multerConfigMemoryOnly), ValidateImageInterceptor)
    @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'portfolio',
  })
  async update(
    @UploadedFiles() newGambar: Express.Multer.File[],
    @Param('portfolioId') portfolioId: number,
    @Body() updatePortfolioDto: any,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const oldPortfolio = await this.portfoliosService.findOne(portfolioId);

      const remainingOldImages = updatePortfolioDto.gambar || [];

      const oldImagesArray = Array.isArray(remainingOldImages)
        ? remainingOldImages
        : [remainingOldImages];

      const originalImages = oldPortfolio.gambar || [];
      const deletedImages = originalImages.filter(
        (url) => !oldImagesArray.includes(url),
      );

      if (deletedImages.length > 0) {
        const deletePromises = deletedImages.map((url) =>
          this.portfoliosService.deleteFile(url).catch((error) => {
          }),
        );
        await Promise.allSettled(deletePromises);
      }

      let finalGambar = [...oldImagesArray];

      if (newGambar && newGambar.length > 0) {
        const newImagePaths = newGambar.map((file) => file.path);
        finalGambar = [...finalGambar, ...newImagePaths];
      }

      if (finalGambar.length > 10) {
        if (newGambar && newGambar.length > 0) {
          const deleteNewImagesPromises = newGambar.map((file) =>
            this.portfoliosService
              .deleteFile(file.path)
              .catch((err) => {
              }),
          );
          await Promise.allSettled(deleteNewImagesPromises);
        }

        req.flash(
          'error',
          `Maximum 10 images allowed. You currently have ${oldImagesArray.length} images.`,
        );
        return res.redirect(`/portfolios/${portfolioId}/edit`);
      }

      const updateData = {
        judul: updatePortfolioDto.judul,
        deskripsi: updatePortfolioDto.deskripsi,
        teknologi: updatePortfolioDto.teknologi,
        gambar: finalGambar,
      };

      await this.portfoliosService.update(portfolioId, updateData);

      req.flash('success', 'Portfolio successfully updated');
      return res.redirect(`/portfolios/${portfolioId}`);
    } catch (error) {

      if (newGambar && newGambar.length > 0) {
        const deleteNewImagesPromises = newGambar.map((file) =>
          this.portfoliosService.deleteFile(file.path).catch((err) => {
          }),
        );
        await Promise.allSettled(deleteNewImagesPromises);
      }

      req.flash('error', error.message || 'Portfolio failed to update');
      return res.redirect(`/portfolios/${portfolioId}/edit`);
    }
  }
}
