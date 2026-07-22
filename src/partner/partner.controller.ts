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
import { PartnerService } from './partner.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { CategoryPartnerService } from 'src/category_partner/category_partner.service';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('partner')
export class PartnerController {
  constructor(
    private readonly PartnerService: PartnerService,
    private readonly categoryPartnerService: CategoryPartnerService,
  ) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'partner',
  })
  async create(
    @Body() createPartnerDto: CreatePartnerDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPartnerDto.gambar = req.body.uploadedImageUrls?.[0];
      await this.PartnerService.create(createPartnerDto);
      req.flash('success', 'partner successfully created');
      res.redirect('/partner');
    } catch (error: any) {
      req.flash('error', error.message || 'partner failed to create');
      res.redirect('/partner');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const partners = await this.PartnerService.findAll();
    res.render('super_admin/partner/index', { user: req.user, partners });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const categories = await this.categoryPartnerService.findAll();
    res.render('super_admin/partner/create', {
      user: req.user,
      categories,
    });
  }

  @Roles('super_admin')
  @Get(':partnerId')
  async findOne(
    @Param('partnerId') partnerId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const partner = await this.PartnerService.findOne(partnerId);
    res.render('super_admin/partner/detail', { user: req.user, partner });
  }

  @Roles('super_admin')
  @Get('formEdit/:partnerId')
  async formEdit(
    @Param('partnerId') partnerId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const partner = await this.PartnerService.findOne(partnerId);
    const categories = await this.categoryPartnerService.findAll();
    res.render('super_admin/partner/edit', {
      user: req.user,
      partner,
      categories,
    });
  }

  @Roles('super_admin')
  @Patch(':partnerId')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'partner',
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('partnerId') partnerId: number,
    @Body() updatePartnerDto: UpdatePartnerDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const partner = await this.PartnerService.findOne(partnerId);
      if (gambar) {
        await this.PartnerService.deleteFile(partner.gambar);
        updatePartnerDto.gambar = req.body.uploadedImageUrls?.[0];
      }
      await this.PartnerService.update(partnerId, updatePartnerDto);
      req.flash('success', 'partner successfully updated');
      res.redirect('/partner');
    } catch (error: any) {
      req.flash('error', error.message || 'partner failed to update');
      res.redirect('/partner');
    }
  }

  @Roles('super_admin')
  @Delete(':partnerId')
  async remove(
    @Param('partnerId') partnerId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const partner = await this.PartnerService.findOne(partnerId);
      if (!partner) {
        req.flash('error', 'partner not found');
        res.redirect('/partner');
        return;
      }
      await this.PartnerService.deleteFile(partner.gambar);
      await this.PartnerService.remove(partnerId);
      req.flash('success', 'partner successfully removed');
      res.redirect('/partner');
    } catch (error: any) {
      req.flash('error', error.message || 'partner failed to remove');
      res.redirect('/partner');
    }
  }
}
