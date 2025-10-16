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
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { multerConfigImage } from 'src/common/config/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthenticatedGuard)
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Roles('user')
  @Post(':kelasId')
  @UseInterceptors(FilesInterceptor('gambar', 10, multerConfigImage))
  async create(
    @UploadedFiles() gambar: Express.Multer.File[],
    @Param('kelasId') kelasId: number,
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPortfolioDto.kelasId = kelasId;
      createPortfolioDto.gambar = gambar.map((file) => file.path);
      if (req.user) {
        createPortfolioDto.userId = req.user.id;
      }
      await this.portfoliosService.create(createPortfolioDto);
      req.flash('success', 'portfolio successfully uploaded');
      res.redirect(`/kelass/${kelasId}`);
    } catch (error) {
      req.flash('error', 'Failed to upload portfolio');
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
    const portfolio = await this.portfoliosService.findByUser(userId);
    res.render('user/myportfolio', { user: req.user, portfolio });
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
  @UseInterceptors(FilesInterceptor('gambar', 10, multerConfigImage))
  async update(
    @UploadedFiles() newGambar: Express.Multer.File[],
    @Param('portfolioId') portfolioId: number,
    @Body() updatePortfolioDto: any,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const oldPortfolio = await this.portfoliosService.findOne(portfolioId);

      // Start with existing images
      let finalGambar = [...(oldPortfolio.gambar || [])];

      // Only process image changes if the gambar field was submitted
      if ('gambar' in updatePortfolioDto) {
        const remainingOldImages = updatePortfolioDto.gambar || [];
        const oldImagesArray = Array.isArray(remainingOldImages)
          ? remainingOldImages
          : [remainingOldImages];

        // Find images that were removed
        const deletedImages = finalGambar.filter(
          (url) => !oldImagesArray.includes(url),
        );

        // Delete removed images from Cloudinary
        for (const url of deletedImages) {
          try {
            const publicId =
              await this.portfoliosService.getPublicIdFromUrl(url);
            if (publicId) {
              await this.portfoliosService.deleteFileIfExists(publicId);
            }
          } catch (error) {
            console.error(`Failed to delete image ${url}:`, error);
          }
        }

        // Update finalGambar with remaining old images
        finalGambar = [...oldImagesArray];
      }

      // Add new uploaded images
      if (newGambar && newGambar.length > 0) {
        const newImagePaths = newGambar.map((file) => file.path);
        finalGambar = [...finalGambar, ...newImagePaths];
      }

      // Validate total images count
      if (finalGambar.length > 10) {
        // If limit exceeded, cleanup new uploads
        if (newGambar && newGambar.length > 0) {
          for (const file of newGambar) {
            try {
              const publicId = await this.portfoliosService.getPublicIdFromUrl(
                file.path,
              );
              if (publicId) {
                await this.portfoliosService.deleteFileIfExists(publicId);
              }
            } catch (err) {
              console.error(`Failed to cleanup new image ${file.path}:`, err);
            }
          }
        }

        req.flash('error', 'Maximum 10 images allowed');
        return res.redirect(`/portfolios/${portfolioId}/edit`);
      }

      // Prepare update data
      const updateData = {
        judul: updatePortfolioDto.judul,
        deskripsi: updatePortfolioDto.deskripsi,
        teknologi: Array.isArray(updatePortfolioDto.teknologi)
          ? updatePortfolioDto.teknologi
          : [updatePortfolioDto.teknologi],
        gambar: finalGambar,
      };

      await this.portfoliosService.update(portfolioId, updateData);

      req.flash('success', 'Portfolio successfully updated');
      return res.redirect(`/portfolios/${portfolioId}`);
    } catch (error) {
      console.error('Portfolio update error:', error);

      // Cleanup new uploads on error
      if (newGambar && newGambar.length > 0) {
        for (const file of newGambar) {
          try {
            const publicId = await this.portfoliosService.getPublicIdFromUrl(
              file.path,
            );
            if (publicId) {
              await this.portfoliosService.deleteFileIfExists(publicId);
            }
          } catch (err) {
            console.error(`Failed to cleanup new image ${file.path}:`, err);
          }
        }
      }

      req.flash('error', 'Portfolio failed to update');
      return res.redirect(`/portfolios/${portfolioId}/edit`);
    }
  }

  @Roles('user')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.portfoliosService.remove(+id);
  }
}
