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
  Query,
  UseFilters,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { flashToast, flashToastError } from 'src/common/utils/toast.util';
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

  /**
   * Tab Portfolio sekarang dimuat per program, jadi halaman tujuan wajib
   * membawa `courseId` program yang sedang dibuka. Tanpa itu setiap penyimpanan
   * melempar student kembali ke program pertama yang ia ikuti, bukan ke
   * program tempat ia sedang menyunting.
   */
  private portfolioRedirectUrl(courseId?: string) {
    const query = courseId
      ? `?tab=course-portfolio&courseId=${encodeURIComponent(courseId)}`
      : '?tab=portfolio';
    return `/users/profile${query}`;
  }

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
      flashToastError(
        req,
        'Portfolio not saved',
        error.message || 'Please try again in a moment.',
      );
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
    // Tipe dan ukuran berkas sudah lama dijanjikan keterangan di bawah kotak
    // unggah ("JPG, JPEG, PNG, or GIF - max 5MB"), tetapi rute ini tidak
    // memeriksa satu pun: berkas 40MB atau .bmp tetap lolos selama dimensinya
    // pas. Sekarang yang dijanjikan layar dan yang dijaga server sama.
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    folder: 'portfolio',
  })
  async create(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const isAjax =
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes('application/json'));

    try {
      const editorjsData = await this.portfoliosService.ChangeImageEditorJS(
        createPortfolioDto.content,
        '/asset/portfolio/temp',
        '/asset/portfolio/isi',
        '/asset/portfolio/temp',
      );

      createPortfolioDto.content = editorjsData;

      const html = editorjsHTML.parse(JSON.parse(editorjsData));

      createPortfolioDto.contentHtml = html;

      const courseId = createPortfolioDto.courseId;
      createPortfolioDto.image = req.body.uploadedImageUrls;
      if (req.user) {
        createPortfolioDto.userId = req.user.id;
      }
      const newPortfolio =
        await this.portfoliosService.create(createPortfolioDto);

      if (isAjax) {
        return res.status(201).json({
          success: true,
          message: 'Portfolio successfully created',
          data: newPortfolio,
        });
      }

      req.flash('success', 'portofolios successfully upload');
      res.redirect(this.portfolioRedirectUrl(courseId));
    } catch (error: any) {
      if (isAjax) {
        return res.status(400).json({
          success: false,
          message: error.message || 'Failed to upload portofolios',
        });
      }

      flashToastError(
        req,
        'Upload failed',
        error.message || 'The image could not be uploaded. Please try again.',
      );
      res.redirect(this.portfolioRedirectUrl(createPortfolioDto.courseId));
    }
  }

  @Roles('user')
  @Get('myportfolio/:userId')
  async myPortfolio(
    @Req() req: Request,
    @Res() res: Response,
    @Param('userId') userId: string,
  ) {
    const category =
      await this.portfoliosService.findCategoryMyPortfolio(userId);
    const courseType =
      await this.portfoliosService.findMyPortfolioCourseTypes(userId);
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
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('user/portofolios/create', {
      user: req.user,
      courseId,
      bareShell: true,
    });
  }

  @Roles('user')
  @Get('fragment')
  async fragment(
    @Req() req: Request,
    @Res() res: Response,
    @Query('courseId') courseId?: string,
  ) {
    const userId = req.user?.id;
    if (!userId || !courseId) {
      return res.send('');
    }

    // Galeri ini menampilkan karya SETIAP student di program tersebut, jadi
    // program yang boleh dibuka dibatasi ke yang benar-benar diikuti pemanggil.
    // Tanpa baris ini `?courseId=` bisa diisi program mana saja.
    if (!(await this.portfoliosService.isEnrolledInCourse(userId, courseId))) {
      return res.send('');
    }

    return res.render(
      'partials/user/sidebar_user_profile/my_portofolio/index',
      {
        // Satu berkas JSON untuk seluruh panel. Partial ini dimuat lewat
        // loadCourseFragment yang menempelkannya dengan `innerHTML`, dan skrip
        // yang disisipkan begitu TIDAK dieksekusi - jadi data tidak boleh lewat
        // `window.x = ...` di dalam partial. `jsonSafe` menutup lubang `</script>`
        // di dalam teks portfolio.
        portfolioData: {
          currentUserId: userId,
          // Tombol Create Portfolio hanya muncul setelah student menyelesaikan
          // seluruh week atau syllabus di program ini (user_courses.progress = true).
          canCreatePortfolio: await this.portfoliosService.hasCompletedLearning(
            userId,
            String(courseId),
          ),
          course: await this.portfoliosService.findCourseForPortfolio(
            String(courseId),
          ),
          items: await this.portfoliosService.findByCourse(
            String(courseId),
            userId,
          ),
        },
        layout: false,
      },
    );
  }

  @Roles('user')
  @Get(':portofolioId/:courseId')
  async findOne(
    @Param('portofolioId') portofolioId: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const portfolio = await this.portfoliosService.findOne(portofolioId);
    res.render('user/portofolios/detail', {
      user: req.user,
      portfolio,
      courseId,
      bareShell: true,
    });
  }

  @Roles('user')
  @Get('formEdit/:portfolioId/:courseId')
  async formEdit(
    @Param('portfolioId') portfolioId: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // Halaman formulir ikut dijaga, bukan hanya aksi simpannya: tanpa ini
    // student lain tetap bisa membuka formulir edit karya orang lain hanya
    // dengan menebak URL-nya, walau saving-nya nanti ditolak.
    const portfolio = await this.portfoliosService.findOwnedOne(
      portfolioId,
      req.user?.id,
    );
    res.render('user/portofolios/edit', {
      user: req.user,
      portfolio,
      courseId,
      bareShell: true,
    });
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
    @Param('portfolioId') portfolioId: string,
    @Param('courseId') courseId: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const isAjax =
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes('application/json'));

    try {
      const oldPortfolio = await this.portfoliosService.findOwnedOne(
        portfolioId,
        req.user?.id,
      );

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

      // Gambar lama yang dipertahankan dikirim lewat `keepImages`, bukan
      // `image`: nama `image` dipakai juga oleh berkas yang diunggah, dan pada
      // multipart keduanya bertabrakan - form edit lama mengirimnya sebagai
      // `image[]` sehingga tidak pernah terbaca DTO, dan setiap penyimpanan
      // menghapus seluruh gambar lamanya. `image` tetap dibaca sebagai
      // cadangan untuk pemanggil lama.
      const rawKeep = (req.body.keepImages ??
        req.body['keepImages[]'] ??
        updatePortfolioDto.image ??
        []) as string | string[];
      const keptImages = (Array.isArray(rawKeep) ? rawKeep : [rawKeep]).filter(
        (url): url is string => typeof url === 'string' && url.length > 0,
      );
      const combineImage = [
        ...keptImages,
        ...(req.body.uploadedImageUrls || []),
      ];
      const newImageUrls = await this.portfoliosService.deleteUnusedImages(
        oldPortfolio.image,
        combineImage,
      );

      const updateData = {
        title: updatePortfolioDto.title,
        description: updatePortfolioDto.description,
        // `link` sempat tidak ikut di sini, jadi menyunting portfolio tidak
        // pernah bisa mengubah tautan proyeknya.
        link: updatePortfolioDto.link,
        image: newImageUrls,
        content: updatePortfolioDto.content,
        contentHtml: updatePortfolioDto.contentHtml,
      };

      await this.portfoliosService.update(portfolioId, updateData);

      if (isAjax) {
        return res.status(200).json({
          success: true,
          message: 'Portfolio successfully updated',
        });
      }

      flashToast(req, 'Portfolio updated', 'Your changes have been saved.');
      return res.redirect(this.portfolioRedirectUrl(courseId));
    } catch (error: any) {
      if (isAjax) {
        return res.status(400).json({
          success: false,
          message: error.message || 'Failed to update portfolio',
        });
      }

      flashToastError(
        req,
        'Portfolio not saved',
        error.message || 'Please try again in a moment.',
      );
      return res.redirect(this.portfolioRedirectUrl(courseId));
    }
  }

  @Roles('user', 'admin', 'super_admin')
  @Delete(':portfolioId/:courseId')
  async remove(
    @Param('portfolioId') portfolioId: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const isAjax =
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes('application/json'));

    const isPrivileged =
      req.user?.role === 'admin' || req.user?.role === 'super_admin';

    try {
      const portfolio = isPrivileged
        ? await this.portfoliosService.findOne(portfolioId)
        : await this.portfoliosService.findOwnedOne(
            portfolioId,
            req.user?.id,
          );
      for (const imageUrl of portfolio.image ?? []) {
        await this.portfoliosService.deleteFile(imageUrl);
      }
      await this.portfoliosService.remove(portfolio);

      if (isAjax) {
        return res.status(200).json({
          success: true,
          message: 'Portfolio successfully deleted',
        });
      }

      flashToast(req, 'Portfolio deleted', 'The portfolio has been removed.');
      if (isPrivileged) {
        return res.redirect(`/program/detail/program/admin/${courseId}`);
      }
      res.redirect(this.portfolioRedirectUrl(courseId));
    } catch (error: any) {
      if (isAjax) {
        return res.status(400).json({
          success: false,
          message: error.message || 'Failed to delete portfolio',
        });
      }

      flashToastError(
        req,
        'Portfolio not deleted',
        error.message || 'Please try again in a moment.',
      );
      if (isPrivileged) {
        return res.redirect(`/program/detail/program/admin/${courseId}`);
      }
      res.redirect(this.portfolioRedirectUrl(courseId));
    }
  }
}
