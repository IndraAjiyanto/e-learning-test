import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { KategorisService } from './kategoris.service';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('kategoris')
export class KategorisController {
  constructor(private readonly kategorisService: KategorisService) {}

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res:Response, @Req() req:Request) {
    const kategori = await this.kategorisService.findAll()
    res.render('super_admin/kategori/index', {user: req.user, kategori})
  }

  @Roles('super_admin')
  @Get(':kategoriId')
  async findOne(@Param('kategoriId') kategoriId: number, @Res() res:Response, @Req() req:Request) {
    const kategori = await this.kategorisService.findOne(kategoriId);
    const alur_kelas = await this.kategorisService.findAlurKelas(kategoriId)
    res.render('super_admin/kategori/detail', {user: req.user, kategori})
  }

  @Roles('super_admin')
  @Get('formEdit/:kategoriId')
  async formEdit(@Param('kategoriId') kategoriId: number, @Res() res:Response, @Req() req:Request){
        const kategori = await this.kategorisService.findOne(kategoriId);
    res.render('super_admin/kategori/edit', {user: req.user, kategori})
  }

  @Roles('super_admin')
  @Patch(':kategoriId')
  @UseInterceptors(FileInterceptor('icon', multerConfigImage))
  async update(@Param('kategoriId') kategoriId: number, @UploadedFile() icon: Express.Multer.File, @Body() updateKategorisDto: UpdateKategorisDto, @Res() res:Response, @Req() req:Request) {
    try {
      const kategori = await this.kategorisService.findOne(kategoriId)
      if(icon){
        await this.kategorisService.getPublicIdFromUrl(kategori.icon);
        updateKategorisDto.icon = icon.path
      }
    await this.kategorisService.update(kategoriId, updateKategorisDto);
    req.flash('success', 'kategori successfully updated')
    res.redirect('/kategoris')
    } catch (error) {
          req.flash('success', 'kategori failed to update')
    res.redirect('/kategoris')
    }
  }

}
