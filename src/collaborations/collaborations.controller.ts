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
import { UpdateCollaborationsDto } from './dto/update-collaborations.dto';
import { CollaborationsService } from './collaborations.service';
import { CreateCollaborationsDto } from './dto/create-collaborations.dto';
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
import { PartnerService } from 'src/partner/partner.service';
import { CreatePartnerDto } from 'src/partner/dto/create-partner.dto';
import { UpdatePartnerDto } from 'src/partner/dto/update-partner.dto';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('partnership')
export class PartnerController {
  constructor(
    private readonly CollaborationsService: CollaborationsService,
    private readonly PartnerService: PartnerService,
    private readonly categoryPartnerService: CategoryPartnerService,
  ) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'collaborations',
  })
  async create(
    @Body() createKerjaSamaDto: CreateCollaborationsDto,
    @Body() createPartnerDto: CreatePartnerDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createKerjaSamaDto.image = req.body.uploadedImageUrls?.[0];
      await this.CollaborationsService.create(createKerjaSamaDto);
      createPartnerDto.image = req.body.uploadedImageUrls?.[0];
      await this.PartnerService.create(createPartnerDto);
      req.flash('success', 'partnership successfully created');
      res.redirect('/partnership');
    } catch (error: any) {
      req.flash('error', error.message || 'partnership failed to create');
      res.redirect('/partnership');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const collaborations = await this.CollaborationsService.findAll();
    const kerja_sama = await this.PartnerService.findAll();
    res.render('super_admin/collaborations/index', {
      user: req.user,
      collaborations,
      kerja_sama,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const categories = await this.categoryPartnerService.findAll();
    res.render('super_admin/collaborations/create', {
      user: req.user,
      categories,
    });
  }

  @Roles('super_admin')
  @Get(':collaborationsId')
  async findOne(
    @Param('collaborationsId') collaborationsId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const collaborations =
      await this.CollaborationsService.findOne(collaborationsId);
    const kerja_sama = await this.PartnerService.findOne(collaborationsId);
    res.render('super_admin/collaborations/detail', {
      user: req.user,
      collaborations,
      kerja_sama,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:collaborationsId')
  async formEdit(
    @Param('collaborationsId') collaborationsId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const collaborations =
      await this.CollaborationsService.findOne(collaborationsId);
    const kerja_sama = await this.PartnerService.findOne(collaborationsId);
    const categories = await this.categoryPartnerService.findAll();
    res.render('super_admin/collaborations/edit', {
      user: req.user,
      collaborations,
      kerja_sama,
      categories,
    });
  }

  @Roles('super_admin')
  @Patch(':collaborationsId')
  @UseInterceptors(
    FileInterceptor('image', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 2000,
    minHeight: 300,
    maxHeight: 2000,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'collaborations',
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('collaborationsId') collaborationsId: number,
    @Body() updateKerjaSamaDto: UpdateCollaborationsDto,
    @Body() updatePartnerDto: UpdatePartnerDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const collaborations =
        await this.CollaborationsService.findOne(collaborationsId);
      if (gambar) {
        await this.CollaborationsService.deleteFile(collaborations.image);
        updateKerjaSamaDto.image = req.body.uploadedImageUrls?.[0];
      }
      await this.CollaborationsService.update(
        collaborationsId,
        updateKerjaSamaDto,
      );

      const kerja_sama = await this.PartnerService.findOne(collaborationsId);
      if (gambar) {
        await this.PartnerService.deleteFile(kerja_sama.image);
        updatePartnerDto.image = req.body.uploadedImageUrls?.[0];
      }
      await this.PartnerService.update(collaborationsId, updatePartnerDto);

      req.flash('success', 'partnership successfully updated');
      res.redirect('/partnership');
    } catch (error: any) {
      req.flash('error', error.message || 'partnership failed to update');
      res.redirect('/partnership');
    }
  }

  @Roles('super_admin')
  @Delete(':collaborationsId')
  async remove(
    @Param('collaborationsId') collaborationsId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const collaborations =
        await this.CollaborationsService.findOne(collaborationsId);
      if (!collaborations) {
        req.flash('error', 'partnership not found');
        res.redirect('/partnership');
        return;
      }
      await this.CollaborationsService.deleteFile(collaborations.image);
      await this.CollaborationsService.remove(collaborationsId);

      const kerja_sama = await this.PartnerService.findOne(collaborationsId);
      if (!kerja_sama) {
        req.flash('error', 'partnership not found');
        res.redirect('/partnership');
        return;
      }
      await this.PartnerService.deleteFile(kerja_sama.image);
      await this.PartnerService.remove(collaborationsId);

      req.flash('success', 'partnership successfully removed');
      res.redirect('/partnership');
    } catch (error: any) {
      req.flash('error', error.message || 'partnership failed to remove');
      res.redirect('/partnership');
    }
  }
}
