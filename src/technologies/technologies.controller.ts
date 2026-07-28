import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologiesDto } from './dto/create-technologies.dto';
import { UpdateTechnologiesDto } from './dto/update-technologies.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseGuards(AuthenticatedGuard)
@UseInterceptors(MulterErrorInterceptor)
@Controller('technology')
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    folder: 'technology',
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
  })
  async create(
    @Body() createTechnologiesDto: CreateTechnologiesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createTechnologiesDto.imgUrl = req.body.uploadedImageUrls?.[0] || null;

      const isSvgEmpty = createTechnologiesDto.svg === '';
      if (isSvgEmpty) {
        createTechnologiesDto.svg = null;
      }

      if (!createTechnologiesDto.svg && !createTechnologiesDto.imgUrl) {
        throw new BadRequestException('SVG atau Gambar (Image) wajib diisi salah satunya!');
      }

      await this.technologiesService.create(createTechnologiesDto);
      req.flash('success', 'Tech successfully created');
      res.redirect('/technology');
    } catch (error: any) {
      req.flash('error', error.message || 'Tech failed to create');
      res.redirect('/technology');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const technologies = await this.technologiesService.findAll();
    res.render('super_admin/technologies/index', { user: req.user, technologies });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/technologies/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const technologies = await this.technologiesService.findOne(id);
    res.render('super_admin/technologies/edit', { user: req.user, technologies });
  }

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    folder: 'technology',
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
  })
  async update(
    @Param('id') id: number,
    @Body() updateTechnologiesDto: UpdateTechnologiesDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      if (req.body.uploadedImageUrls?.[0]) {
        updateTechnologiesDto.imgUrl = req.body.uploadedImageUrls[0];
      } else if (req.body.remove_image === 'true') {
        updateTechnologiesDto.imgUrl = null;
      }
      
      const existingTech = await this.technologiesService.findOne(id);
      if (!existingTech) {
        throw new BadRequestException('Tech not found');
      }

      const isSvgEmpty = updateTechnologiesDto.svg === '';
      const finalSvg = updateTechnologiesDto.svg !== undefined ? updateTechnologiesDto.svg : existingTech.svg;
      const finalImgUrl = updateTechnologiesDto.imgUrl !== undefined ? updateTechnologiesDto.imgUrl : existingTech.imgUrl;

      if ((isSvgEmpty || !finalSvg) && !finalImgUrl) {
         throw new BadRequestException('SVG atau Gambar (Image) wajib diisi salah satunya!');
      }

      // Ensure empty string SVG is saved as null to prevent Handlebars issues
      if (isSvgEmpty) {
        updateTechnologiesDto.svg = null;
      }

      await this.technologiesService.update(id, updateTechnologiesDto);
      req.flash('success', 'Tech successfully updated');
      res.redirect('/technology');
    } catch (error: any) {
      req.flash('error', error.message || 'Tech failed to update');
      res.redirect(`/technology/formEdit/${id}`);
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
      const technologies = await this.technologiesService.findOne(id);
      if (!technologies) {
        req.flash('error', 'Tech not found');
        res.redirect('/technology');
      }
      await this.technologiesService.remove(id);
      req.flash('success', 'Tech   successfully deleted');
      res.redirect('/technology');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete tech');
      res.redirect('/technology');
    }
  }
}
