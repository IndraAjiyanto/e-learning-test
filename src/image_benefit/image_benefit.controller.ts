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
import { ImageBenefitService } from './image_benefit.service';
import { CreateImageBenefitDto } from './dto/create-image_benefit.dto';
import { UpdateImageBenefitDto } from './dto/update-image_benefit.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('benefit-image')
export class ImageBenefitController {
  constructor(private readonly gambarBenefitService: ImageBenefitService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 700,
    maxWidth: 4000,
    minHeight: 700,
    maxHeight: 1500,
    maxSize: 3 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'image_benefit',
  })
  async create(
    @Body() createImageBenefitDto: CreateImageBenefitDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createImageBenefitDto.image = req.body.uploadedImageUrls?.[0];
      await this.gambarBenefitService.create(createImageBenefitDto);
      req.flash('success', 'Image Benefit successfully created');
      res.redirect('/benefit-image');
    } catch (error: any) {
      req.flash('error', error.message || 'Image Benefit failed to create');
      res.redirect('/benefit-image');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const benefit_images = await this.gambarBenefitService.findAll();
    res.render('super_admin/benefit_images/index', {
      user: req.user,
      benefit_images,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const availableNumbers = await this.gambarBenefitService.findNo();
    res.render('super_admin/benefit_images/create', { user: req.user, availableNumbers });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const benefit_images = await this.gambarBenefitService.findOne(+id);
    res.render('super_admin/benefit_images/edit', {
      user: req.user,
      benefit_images,
    });
  }

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 700,
    maxWidth: 4000,
    minHeight: 700,
    maxHeight: 1500,
    maxSize: 3 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'image_benefit',
  })
  async update(
    @UploadedFile() image: Express.Multer.File,
    @Param('id') id: number,
    @Body() updateImageBenefitDto: UpdateImageBenefitDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const image_benefit = await this.gambarBenefitService.findOne(+id);
      if (image) {
        await this.gambarBenefitService.deleteFile(image_benefit.image);
        updateImageBenefitDto.image = req.body.uploadedImageUrls?.[0];
      }
      await this.gambarBenefitService.update(+id, updateImageBenefitDto);
      req.flash('success', 'Image Benefit successfully updated');
      res.redirect('/benefit-image');
    } catch (error: any) {
      req.flash('error', error.message || 'Image Benefit failed to update');
      res.redirect('/benefit-image');
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
      const image_benefit = await this.gambarBenefitService.findOne(id);
      if (!image_benefit) {
        req.flash('error', 'Image Benefit not found');
        res.redirect('/benefit-image');
      }
      await this.gambarBenefitService.deleteFile(image_benefit.image);
      await this.gambarBenefitService.remove(id);
      req.flash('success', 'Image Benefit successfully removed');
      res.redirect('/benefit-image');
    } catch (error: any) {
      req.flash('error', error.message || 'Image Benefit failed to remove');
      res.redirect('/benefit-image');
    }
  }
}
