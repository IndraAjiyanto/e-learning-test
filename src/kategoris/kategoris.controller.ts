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
  UseFilters,
} from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('category')
export class KategorisController {
  constructor(private readonly kategorisService: KategorisService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('icon', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1000,
    maxWidth: 2000,
    minHeight: 1000,
    maxHeight: 2000,
    folder: 'kategori',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async create(
    @Body() createKategorisDto: CreateKategorisDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createKategorisDto.icon = req.body.uploadedImageUrls?.[0];
      await this.kategorisService.create(createKategorisDto);
      req.flash('success', 'kategori successfully created');
      res.redirect('/category');
    } catch (error: any) {
      req.flash('error', error.message || 'kategori failed to create');
      res.redirect('/category');
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const jenisKelas = await this.kategorisService.findJenisKelas();
    res.render('super_admin/kategori/create', { user: req.user, jenisKelas });
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const kategori = await this.kategorisService.findAll();
    res.render('super_admin/kategori/index', { user: req.user, kategori });
  }

  @Get('program/:kategoriName')
  async program(
    @Param('kategoriName') kategoriName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const kategori = await this.kategorisService.findOneKategori(kategoriName);
    const benefit_category = await this.kategorisService.findBenefitByKategori(
      kategori.id,
    );
    const flow_category = await this.kategorisService.findFlowByKategori(
      kategori.id,
    );
    const superiority = await this.kategorisService.findSuperiorityByKategori(
      kategori.id,
    );
    const pertanyaan_umum = await this.kategorisService.findFaqByKategori(
      kategori.id,
    );
    const alumni = await this.kategorisService.findAlumniByKategori(
      kategori.id,
    );
    // const kelas = await this.kategorisService.findKelasByKategori(kategori.id);
    const viewData = {
      kategori,
      user: req.user,
      // kelas,
      alumni,
      benefit_category,
      flow_category,
      superiority,
      pertanyaan_umum,
    };

    if (kategori?.type === 'Paid Program') {
      res.render('paid_program', viewData);
    } else if (kategori?.type === 'Free Program') {
      res.render('free_program', viewData);
    } else {
      res.render('special_program', viewData);
    }

  }

  @Roles('super_admin')
  @Get('benefit/:kategoriId')
  async findBenefitByKategori(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
  ) {
    const benefit_category =
      await this.kategorisService.findBenefitByKategori(kategoriId);
    res.json(benefit_category);
  }

  @Roles('super_admin')
  @Get('flow/:kategoriId')
  async findFlowByKategori(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
  ) {
    const flow_category =
      await this.kategorisService.findFlowByKategori(kategoriId);
    res.json(flow_category);
  }

  @Roles('super_admin')
  @Get('superiority/:kategoriId')
  async findSuperiorityByKategori(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
  ) {
    const superiority =
      await this.kategorisService.findSuperiorityByKategori(kategoriId);
    res.json(superiority);
  }

  @Roles('super_admin')
  @Get('faq/:kategoriId')
  async findFaqByKategori(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
  ) {
    const pertanyaan_umum =
      await this.kategorisService.findFaqByKategori(kategoriId);
    res.json(pertanyaan_umum);
  }

  @Roles('super_admin')
  @Get('admin/program/:kategoriId')
  async findKelasByKategori(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
  ) {
    const kelas =
      await this.kategorisService.findKelasByKategoriAll(kategoriId);
    res.json(kelas);
  }

  @Roles('super_admin')
  @Get('alumni/:kategoriId')
  async findAlumniByKategori(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
  ) {
    const alumni = await this.kategorisService.findAlumniByKategori(kategoriId);
    res.json(alumni);
  }

  @Roles('super_admin')
  @Get(':kategoriId')
  async findOne(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kategori = await this.kategorisService.findOne(kategoriId);

    res.render('super_admin/kategori/detail', {
      user: req.user,
      kategori,
    });
  }

  @Roles('super_admin')
  @Get('formEdit/:kategoriId')
  async formEdit(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kategori = await this.kategorisService.findOne(kategoriId);
    const jenisKelas = await this.kategorisService.findJenisKelas();
    res.render('super_admin/kategori/edit', {
      user: req.user,
      kategori,
      jenisKelas,
    });
  }

  @Roles('super_admin')
  @Patch(':kategoriId')
  @UseInterceptors(
    FileInterceptor('icon', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1000,
    maxWidth: 2000,
    minHeight: 1000,
    maxHeight: 2000,
    folder: 'kategori',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async update(
    @Param('kategoriId') kategoriId: number,
    @Body() updateKategorisDto: UpdateKategorisDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kategori = await this.kategorisService.findOne(kategoriId);
      if (req.body.uploadedImageUrls) {
        await this.kategorisService.deleteFile(kategori.icon);
        updateKategorisDto.icon = req.body.uploadedImageUrls?.[0];
      }
      await this.kategorisService.update(kategoriId, updateKategorisDto);
      req.flash('success', 'kategori successfully updated');
      res.redirect('/category/' + kategoriId);
    } catch (error: any) {
      console.log(error);
      req.flash('error', error.message || 'kategori failed to update');
      res.redirect('/category/' + kategoriId);
    }
  }

  @Roles('super_admin')
  @Delete(':kategoriId')
  async remove(
    @Param('kategoriId') kategoriId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kategori = await this.kategorisService.findOne(kategoriId);
      await this.kategorisService.deleteFile(kategori.icon);
      await this.kategorisService.remove(kategoriId);
      req.flash('success', 'kategori successfully deleted');
      res.redirect('/category');
    } catch (error: any) {
      req.flash('success', 'kategori failed to delete');
      res.redirect('/category');
    }
  }
}
