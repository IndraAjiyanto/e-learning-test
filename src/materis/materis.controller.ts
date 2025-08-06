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

@UseGuards(AuthenticatedGuard)
@Controller('materis')
export class MaterisController {
  constructor(private readonly materisService: MaterisService) {}

  @Roles('admin')
@Post('pdf')
@UseInterceptors(FileInterceptor('file', multerConfigPdf))
createPdf(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
) {
  createMaterisDto.file = file.filename; 
  return this.materisService.create(createMaterisDto);
}

  @Roles('admin')
@Post('ppt')
@UseInterceptors(FileInterceptor('file', multerConfigPpt))
createPpt(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
) {
  createMaterisDto.file = file.filename; 
  return this.materisService.create(createMaterisDto);
}

  @Roles('admin')
@Post('video')
@UseInterceptors(FileInterceptor('file', multerConfigVideo))
createVideo(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
) {
  createMaterisDto.file = file.filename; 
  return this.materisService.create(createMaterisDto);
}

  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.materisService.findOne(id);
  }

  @Roles('admin', 'user')
@Get('/kelas/:kelasId')
findMateriByKelas(@Param('kelasId') kelasId: number){
return this.materisService.findMateriBykelas(kelasId)
}

  @Roles('admin', 'user')
  @Get(':jenis_file/:kelasId')
  async findMateriByJenisFile(@Param('jenis_file') jenis_file: JenisFile, @Param('kelasId') kelasId: number, @Res() res: Response, @Req() req: any){
    const pertemuan = await this.materisService.findPertemuanByKelas(kelasId)
    const materi = await this.materisService.findIdentityMateri(jenis_file, kelasId)
    res.render('materi/materi', {materi, user: req.user, pertemuan})
  }

  // @Get('edit/materi/:id')
  // formEditMateri(@Param('id') id: string) {
  //   return this.materisService.findMateri(+id);
  // }

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
  removePdf(@Param('id') id: number) {
    return this.materisService.remove(id);
  }
}
