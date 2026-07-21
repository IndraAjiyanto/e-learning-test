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
import { CollaborationsService } from './collaborations.service';
import { CreateCollaborationsDto } from './dto/create-collaborations.dto';
import { UpdateCollaborationsDto } from './dto/update-collaborations.dto';
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
@Controller('partnership')
export class CollaborationsController {
  constructor(private readonly kerjaSamaService: CollaborationsService) {}

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
    folder: 'collaborations',
  })
  async create(
    @Body() createKerjaSamaDto: CreateCollaborationsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createKerjaSamaDto.image = req.body.uploadedImageUrls?.[0];
      await this.kerjaSamaService.create(createKerjaSamaDto);
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
    const collaborations = await this.kerjaSamaService.findAll();
    res.render('super_admin/collaborations/index', { user: req.user, collaborations });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/collaborations/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get(':collaborationsId')
  async findOne(
    @Param('collaborationsId') collaborationsId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const collaborations = await this.kerjaSamaService.findOne(collaborationsId);
    res.render('super_admin/collaborations/detail', { user: req.user, collaborations });
  }

  @Roles('super_admin')
  @Get('formEdit/:collaborationsId')
  async formEdit(
    @Param('collaborationsId') collaborationsId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const collaborations = await this.kerjaSamaService.findOne(collaborationsId);
    res.render('super_admin/collaborations/edit', { user: req.user, collaborations });
  }

  @Roles('super_admin')
  @Patch(':collaborationsId')
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
    folder: 'collaborations',
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('collaborationsId') collaborationsId: number,
    @Body() updateKerjaSamaDto: UpdateCollaborationsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const collaborations = await this.kerjaSamaService.findOne(collaborationsId);
      if (gambar) {
        await this.kerjaSamaService.deleteFile(collaborations.image);
        updateKerjaSamaDto.image = req.body.uploadedImageUrls?.[0];
      }
      await this.kerjaSamaService.update(collaborationsId, updateKerjaSamaDto);
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
      const collaborations = await this.kerjaSamaService.findOne(collaborationsId);
      if (!collaborations) {
        req.flash('error', 'partnership not found');
        res.redirect('/partnership');
      }
      await this.kerjaSamaService.deleteFile(collaborations.image);
      await this.kerjaSamaService.remove(collaborationsId);
      req.flash('success', 'partnership successfully remove');
      res.redirect('/partnership');
    } catch (error: any) {
      req.flash('error', error.message || 'partnership failed to remove');
      res.redirect('/partnership');
    }
  }
}
