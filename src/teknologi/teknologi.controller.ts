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
import { TeknologiService } from './teknologi.service';
import { CreateTeknologiDto } from './dto/create-teknologi.dto';
import { UpdateTeknologiDto } from './dto/update-teknologi.dto';
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
export class TeknologiController {
  constructor(private readonly teknologiService: TeknologiService) {}

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
    @Body() createTeknologiDto: CreateTeknologiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createTeknologiDto.img_url = req.body.uploadedImageUrls?.[0] || null;

      const isSvgEmpty = createTeknologiDto.svg === '';
      if (isSvgEmpty) {
        createTeknologiDto.svg = null;
      }

      if (!createTeknologiDto.svg && !createTeknologiDto.img_url) {
        throw new BadRequestException('SVG atau Gambar (Image) wajib diisi salah satunya!');
      }

      await this.teknologiService.create(createTeknologiDto);
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
    const teknologi = await this.teknologiService.findAll();
    res.render('super_admin/teknologi/index', { user: req.user, teknologi });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/teknologi/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const teknologi = await this.teknologiService.findOne(id);
    res.render('super_admin/teknologi/edit', { user: req.user, teknologi });
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
    @Body() updateTeknologiDto: UpdateTeknologiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      if (req.body.uploadedImageUrls?.[0]) {
        updateTeknologiDto.img_url = req.body.uploadedImageUrls[0];
      } else if (req.body.remove_image === 'true') {
        updateTeknologiDto.img_url = null;
      }
      
      const existingTech = await this.teknologiService.findOne(id);
      if (!existingTech) {
        throw new BadRequestException('Tech not found');
      }

      const isSvgEmpty = updateTeknologiDto.svg === '';
      const finalSvg = updateTeknologiDto.svg !== undefined ? updateTeknologiDto.svg : existingTech.svg;
      const finalImgUrl = updateTeknologiDto.img_url !== undefined ? updateTeknologiDto.img_url : existingTech.img_url;

      if ((isSvgEmpty || !finalSvg) && !finalImgUrl) {
         throw new BadRequestException('SVG atau Gambar (Image) wajib diisi salah satunya!');
      }

      // Ensure empty string SVG is saved as null to prevent Handlebars issues
      if (isSvgEmpty) {
        updateTeknologiDto.svg = null;
      }

      await this.teknologiService.update(id, updateTeknologiDto);
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
      const teknologi = await this.teknologiService.findOne(id);
      if (!teknologi) {
        req.flash('error', 'Tech not found');
        res.redirect('/technology');
      }
      await this.teknologiService.remove(id);
      req.flash('success', 'Tech   successfully deleted');
      res.redirect('/technology');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete tech');
      res.redirect('/technology');
    }
  }
}
