import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards, Res, Req } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigPdf, multerConfigPpt, multerConfigVideo } from 'src/common/config/multer.config';
import { JenisFile } from 'src/entities/materi.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Response } from 'express';
import { join } from 'path';
const spire = require('spire.presentation').default;
import { promises as fs } from 'fs';
import { ConvertApiService } from 'src/common/config/convertapi.service';

@UseGuards(AuthenticatedGuard)
@Controller('materis')
export class MaterisController {
  constructor(private readonly materisService: MaterisService, private readonly convertApiService: ConvertApiService) {}

  @Roles('admin')
@Post('pdf/:id')
@UseInterceptors(FileInterceptor('file', multerConfigPdf))
async createPdf(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
  @Res() res:Response,
  @Param('id') id: number,
) {
  createMaterisDto.file = file.filename; 
  createMaterisDto.pertemuanId = id; 
  createMaterisDto.jenis_file = "pdf"
  await this.materisService.create(createMaterisDto);
  res.redirect('/pertemuans')
}

 @Roles('admin')
  @Post('ppt/:id')
  @UseInterceptors(FileInterceptor('file', multerConfigPpt))
  async createPpt(
    @Body() createMaterisDto: CreateMaterisDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Param('id') id: number
  ) {
    try {
      createMaterisDto.file = file.filename;
      createMaterisDto.pertemuanId = id;
      createMaterisDto.jenis_file = "ppt";
      
      await this.materisService.create(createMaterisDto);

      const inputPath = join(process.cwd(), file.path);
      const outputDir = join(process.cwd(), 'uploads', 'ppt', file.filename + '_slides');

      const slideUrls = await this.convertApiService.pptToPng(inputPath, outputDir);

      await fs.unlink(inputPath);

      console.log('Conversion completed. Slide URLs:', slideUrls);
      
      res.redirect('/pertemuans');
    } catch (error) {
      console.error('Error in createPpt:', error);
      res.status(500).json({ 
        message: 'Failed to process PPT file',
        error: error.message 
      });
    }
  }

  @Roles('admin')
@Post('video/:id')
@UseInterceptors(FileInterceptor('file', multerConfigVideo))
async createVideo(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
  @Res() res:Response,
  @Param('id') id:number
) {
  createMaterisDto.file = file.filename; 
  createMaterisDto.pertemuanId = id; 
  createMaterisDto.jenis_file = "video"
  await this.materisService.create(createMaterisDto);
  res.redirect('/pertemuans')
}

@Roles('admin')
@Get('formCreate/:id')
async formCreate(@Param('id') id: number, @Req() req:any, @Res() res:Response){
  const materipdf = await this.materisService.findMateriPdf(id)
  const materivideo = await this.materisService.findMateriVideo(id)
  const materippt = await this.materisService.findMateriPpt(id)
  res.render('admin/materi/index',{user: req.user, id, materipdf, materippt, materivideo})
}

  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.materisService.findOne(id);
  }

  @Roles('admin', 'user')
@Get('/kelas/:pertemuanId')
findMateriByKelas(@Param('pertemuanId') pertemuanId: number){
return this.materisService.findMateriBypertemuan(pertemuanId)
}

  @Roles('admin', 'user')
  @Get(':jenis_file/:kelasId')
  async findMateriByJenisFile(@Param('jenis_file') jenis_file: JenisFile, @Param('kelasId') kelasId: number, @Res() res: Response, @Req() req: any){
    const pertemuan = await this.materisService.findPertemuanByKelas(kelasId)
    if(jenis_file === "video"){
    res.render('materi/video', { user: req.user, pertemuan, kelasId})
    } else if(jenis_file === "pdf"){
    res.render('materi/pdf', { user: req.user, pertemuan, kelasId})
    }else if(jenis_file === "ppt"){
    res.render('materi/ppt', { user: req.user, pertemuan, kelasId})
    }
  }

  @Roles('admin')
  @Get('edit/materi/:id')
  formEditMateri(@Param('id') id: number){
    return this.materisService.findOne(id)
  }

  @Roles('admin')
@Patch('pdf/:id')
@UseInterceptors(FileInterceptor('file', multerConfigPdf)) 
async updatePdf(
  @Param('id') id: number,
  @UploadedFile() file: Express.Multer.File,
  @Body() updateMaterisDto: UpdateMaterisDto
) {
  const materi = await this.materisService.findOne(id);

  if (file) {
    await this.materisService.deleteFileIfExists(materi.file);
    updateMaterisDto.file = file.filename; 
  } 

  return await this.materisService.update(id, updateMaterisDto);
}

  @Roles('admin')
@Patch('video/:id')
@UseInterceptors(FileInterceptor('file', multerConfigVideo)) 
async updateVideo(
  @Param('id') id: number,
  @UploadedFile() file: Express.Multer.File,
  @Body() updateMaterisDto: UpdateMaterisDto
) {
  const materi = await this.materisService.findOne(id);

  if (file) {
    await this.materisService.deleteFileIfExists(materi.file);
    updateMaterisDto.file = file.filename; 
  } 

  return await this.materisService.update(id, updateMaterisDto);
}

  @Roles('admin')
@Patch('ppt/:id')
@UseInterceptors(FileInterceptor('file', multerConfigPpt)) 
async updatePpt(
  @Param('id') id: number,
  @UploadedFile() file: Express.Multer.File,
  @Body() updateMaterisDto: UpdateMaterisDto
) {
  const materi = await this.materisService.findOne(id);

  if (file) {
    await this.materisService.deleteFileIfExists(materi.file);
    updateMaterisDto.file = file.filename; 
  } 

  return await this.materisService.update(id, updateMaterisDto);
}

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res:Response) {
    await this.materisService.remove(id);
    res.redirect('/pertemuans')
  }
}
