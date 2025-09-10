import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards, Res, Req } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigPdf, multerConfigPpt, multerConfigVideo } from 'src/common/config/multer.config';
import { JenisFile } from 'src/entities/materi.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Request, Response } from 'express';
import { join } from 'path';
const spire = require('spire.presentation').default;
import { promises as fs } from 'fs';
import { ConvertApiService } from 'src/common/config/convertapi.service';
import { PertemuansService } from 'src/pertemuans/pertemuans.service';

@UseGuards(AuthenticatedGuard)
@Controller('materis')
export class MaterisController {
  constructor(private readonly materisService: MaterisService,private readonly convertApiService: ConvertApiService) {}

  @Roles('admin')
@Post('pdf/:pertemuanId')
@UseInterceptors(FileInterceptor('file', multerConfigPdf))
async createPdf(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
  @Res() res:Response,
  @Param('pertemuanId') pertemuanId: number,
  @Req() req: Request
) {
  try {
      createMaterisDto.file = file.filename; 
  createMaterisDto.pertemuanId = pertemuanId; 
  createMaterisDto.jenis_file = "pdf"
  await this.materisService.create(createMaterisDto);
  req.flash('success', 'successfuly create materi pdf')
  res.redirect(`/pertemuans/${pertemuanId}`)
  } catch (error) {
      req.flash('error', 'failed create materi pdf')
  res.redirect(`/pertemuans/${pertemuanId}`)
  }

}

 @Roles('admin')
  @Post('ppt/:pertemuanId')
  @UseInterceptors(FileInterceptor('file', multerConfigPpt))
  async createPpt(
    @Body() createMaterisDto: CreateMaterisDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Param('pertemuanId') pertemuanId: number,
    @Req() req:Request
  ) {
    try {
      createMaterisDto.file = file.filename + '_slides';
      createMaterisDto.pertemuanId = pertemuanId;
      createMaterisDto.jenis_file = "ppt";
      
      await this.materisService.create(createMaterisDto);

      const inputPath = join(process.cwd(), file.path);
      const outputDir = join(process.cwd(), 'uploads', 'ppt', file.filename + '_slides');

      const slideUrls = await this.convertApiService.pptToPng(inputPath, outputDir);

      await fs.unlink(inputPath);

      
        req.flash('success', 'successfuly create materi ppt')
  res.redirect(`/pertemuans/${pertemuanId}`)
    } catch (error) {
  req.flash('error', 'failed create materi pdf')
  res.redirect(`/pertemuans/${pertemuanId}`)
    }
  }

  @Roles('admin')
@Post('video/:pertemuanId')
@UseInterceptors(FileInterceptor('file', multerConfigVideo))
async createVideo(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
  @Res() res:Response,
  @Param('pertemuanId') pertemuanId:number,
  @Req() req:Request
) {
  try {
      createMaterisDto.file = file.filename; 
  createMaterisDto.pertemuanId = pertemuanId; 
  createMaterisDto.jenis_file = "video"
  await this.materisService.create(createMaterisDto);
          req.flash('success', 'successfuly create materi video')
  res.redirect(`/pertemuans/${pertemuanId}`)
  } catch (error) {
      req.flash('error', 'failed create materi video')
  res.redirect(`/pertemuans/${pertemuanId}`)
  }

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
  @Get(':jenis_file/:pertemuanId')
  async findMateriByJenisFile(@Param('jenis_file') jenis_file: JenisFile, @Param('pertemuanId') pertemuanId: number, @Res() res: Response, @Req() req: Request){
    const pertemuan = await this.materisService.findPertemuan(pertemuanId)
    if(jenis_file === "video"){
      const materi = await this.materisService.findMateriVideo(pertemuanId)
    res.render('materi/video', { user: req.user, materi, pertemuan})
    } else if(jenis_file === "pdf"){
      const materi = await this.materisService.findMateriPdf(pertemuanId)
    res.render('materi/pdf', { user: req.user, materi, pertemuan})
    }else if(jenis_file === "ppt"){
      const materi = await this.materisService.findMateriPpt(pertemuanId)
      for(const mat of materi){
      console.log(mat.slides)
      }
    res.render('materi/ppt', { user: req.user, materi, pertemuan})
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
  @Delete(':materiId/:pertemuanId')
  async remove(@Param('materiId') materiId: number,@Param('pertemuanId') pertemuanId: number, @Res() res:Response, @Req() req:Request) {
    try {
          await this.materisService.remove(materiId);
              req.flash('success', 'successfully delete materi')
      res.redirect(`/pertemuans/${pertemuanId}`)
    } catch (error) {
      req.flash('error', 'failed delete materi')
      res.redirect(`/pertemuans/${pertemuanId}`)
    }

  }
}
