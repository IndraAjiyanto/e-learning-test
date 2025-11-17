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
  UploadedFile,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { GambarBenefitService } from './gambar_benefit.service';
import { CreateGambarBenefitDto } from './dto/create-gambar_benefit.dto';
import { UpdateGambarBenefitDto } from './dto/update-gambar_benefit.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  createMemoryConfig,
  multerConfigMemory,
} from 'src/common/config/multer.config';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('gambar-benefit')
export class GambarBenefitController {
  constructor(private readonly gambarBenefitService: GambarBenefitService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 700,
    maxWidth: 4000,
    minHeight: 700,
    maxHeight: 1500,
    maxSize: 3 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/gambar_benefit',
  })
  async create(
    @Body() createGambarBenefitDto: CreateGambarBenefitDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createGambarBenefitDto.gambar = req.body.uploadedImageUrls?.[0];
      await this.gambarBenefitService.create(createGambarBenefitDto);
      req.flash('success', 'Image Benefit successfully created');
      res.redirect('/gambar-benefit');
    } catch (error) {
      req.flash('error', error.message || 'Image Benefit failed to create');
      res.redirect('/gambar-benefit');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const gambar_benefit = await this.gambarBenefitService.findAll();
    res.render('super_admin/gambar_benefit/index', {
      user: req.user,
      gambar_benefit,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/gambar_benefit/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const gambar_benefit = await this.gambarBenefitService.findOne(+id);
    res.render('super_admin/gambar_benefit/edit', {
      user: req.user,
      gambar_benefit,
    });
  }

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor(
      'gambar',
      createMemoryConfig({ fileTypes: ['image'], maxSize: 5 }),
    ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 700,
    maxWidth: 4000,
    minHeight: 700,
    maxHeight: 1500,
    maxSize: 3 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/gambar_benefit',
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('id') id: number,
    @Body() updateGambarBenefitDto: UpdateGambarBenefitDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const gambar_benefit = await this.gambarBenefitService.findOne(+id);
      if (gambar) {
        await this.gambarBenefitService.getPublicIdFromUrl(
          gambar_benefit.gambar,
        );
        updateGambarBenefitDto.gambar = req.body.uploadedImageUrls?.[0];
      }
      await this.gambarBenefitService.update(+id, updateGambarBenefitDto);
      req.flash('success', 'Image Benefit successfully updated');
      res.redirect('/gambar-benefit');
    } catch (error) {
      console.log(error);
      req.flash('error', error.message || 'Image Benefit failed to update');
      res.redirect('/gambar-benefit');
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
      const gambar_benefit = await this.gambarBenefitService.findOne(+id);
      if (!gambar_benefit) {
        req.flash('error', 'Image Benefit not found');
        res.redirect('/gambar-benefit');
      }
      await this.gambarBenefitService.getPublicIdFromUrl(gambar_benefit.gambar);
      await this.gambarBenefitService.remove(+id);
      req.flash('success', 'Image Benefit successfully removed');
      res.redirect('/gambar-benefit');
    } catch (error) {
      req.flash('error', error.message || 'Image Benefit failed to remove');
      res.redirect('/gambar-benefit');
    }
  }
}
