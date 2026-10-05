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
  BadRequestException,
  Query,
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
import { flashToast } from 'src/common/utils/toast.util';

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
        throw new BadRequestException(
          'SVG atau Gambar (Image) wajib diisi salah satunya!',
        );
      }

      await this.technologiesService.create(createTechnologiesDto);
      flashToast(
        req,
        'Tool Created',
        'The tool has been added successfully.',
      );
      res.redirect('/technology');
    } catch (error: any) {
      req.flash('error', error.message || 'Tool failed to create');
      res.redirect('/technology');
    }
  }

  // Didaftarkan sebelum route ber-parameter supaya segmen statis 'filter'
  // tidak pernah ditangkap sebagai id.
  @Roles('super_admin')
  @Get('filter')
  async filterTechnologies(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = parseInt(page || '1', 10);
    const itemsPerPage = parseInt(limit || '10', 10);

    const result = await this.technologiesService.findAllPaginated({
      search: search || undefined,
      page: currentPage,
      limit: itemsPerPage,
    });

    return res.json({
      data: result.data,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / itemsPerPage),
      currentPage,
    });
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const technologies = await this.technologiesService.findAll();
    res.render('super_admin/technologies/index', {
      user: req.user,
      technologies,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/technologies/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const technologies = await this.technologiesService.findOne(id);
    res.render('super_admin/technologies/edit', {
      user: req.user,
      technologies,
    });
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
    @Param('id') id: string,
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
      const finalSvg =
        updateTechnologiesDto.svg !== undefined
          ? updateTechnologiesDto.svg
          : existingTech.svg;
      const finalImgUrl =
        updateTechnologiesDto.imgUrl !== undefined
          ? updateTechnologiesDto.imgUrl
          : existingTech.imgUrl;

      if ((isSvgEmpty || !finalSvg) && !finalImgUrl) {
        throw new BadRequestException(
          'SVG atau Gambar (Image) wajib diisi salah satunya!',
        );
      }

      // Ensure empty string SVG is saved as null to prevent Handlebars issues
      if (isSvgEmpty) {
        updateTechnologiesDto.svg = null;
      }

      await this.technologiesService.update(id, updateTechnologiesDto);
      flashToast(
        req,
        'Tool Updated',
        'The changes to this tool have been saved.',
      );
      res.redirect('/technology');
    } catch (error: any) {
      req.flash('error', error.message || 'Tool failed to update');
      res.redirect(`/technology/formEdit/${id}`);
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const technologies = await this.technologiesService.findOne(id);
      if (!technologies) {
        req.flash('error', 'Tool not found');
        res.redirect('/technology');
      }
      await this.technologiesService.remove(id);
      flashToast(
        req,
        'Tool Deleted',
        'The tool has been removed successfully.',
      );
      res.redirect('/technology');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete tool');
      res.redirect('/technology');
    }
  }
}
