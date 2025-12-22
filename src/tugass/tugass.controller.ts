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
  UploadedFile,
} from '@nestjs/common';
import { TugassService } from './tugass.service';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidateFile } from 'src/common/decorators/validate-file.decorator';
import { ValidateFileInterceptor } from 'src/common/interceptors/validate-file.interceptor';
import { memoryStorage } from 'multer';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('tugass')
export class TugassController {
  constructor(private readonly tugassService: TugassService) {}

  @Roles('admin')
  @Post(':pertemuanId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'assignments',
    resourceType: 'raw', // Penting: gunakan 'raw' untuk PDF
  })
  async create(
    @Body() createTugassDto: CreateTugassDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      // Pastikan file berhasil diupload ke Cloudinary
      if (!req.body.uploadedFileUrls || !req.body.uploadedFileUrls[0]) {
        throw new Error('File upload failed. Please try again.');
      }

      createTugassDto.pertemuanId = pertemuanId;
      createTugassDto.file = req.body.uploadedFileUrls[0];
      await this.tugassService.create(createTugassDto);
      req.flash('success', 'Assignment successfully created');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      const errorMessage = error.message || 'Failed to create assignment';
      req.flash('error', errorMessage);
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:pertemuanId')
  async formCreate(
    @Res() res: Response,
    @Req() req: Request,
    @Param('pertemuanId') pertemuanId: number,
  ) {
    res.render('admin/tugas/create', { user: req.user, pertemuanId });
  }

  @Roles('admin')
  @Delete(':tugasId/:pertemuanId')
  async remove(
    @Param('pertemuanId') pertemuanId: number,
    @Param('tugasId') tugasId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const tugas = await this.tugassService.findOne(tugasId);
      await this.tugassService.deleteFile(tugas.file);
      await this.tugassService.remove(tugasId);
      req.flash('success', 'successfuly delete assignment');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', error.message || 'unsuccess delete assignment');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }
}
