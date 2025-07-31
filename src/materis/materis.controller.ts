import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigPdf, multerConfigPpt, multerConfigVideo } from 'src/common/config/multer.config';
import { JenisFile, Materi } from 'src/entities/materi.entity';

@Controller('materis')
export class MaterisController {
  constructor(private readonly materisService: MaterisService) {}

@Post('pdf')
@UseInterceptors(FileInterceptor('file', multerConfigPdf))
createPdf(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
) {
  createMaterisDto.file = file.filename; 
  return this.materisService.create(createMaterisDto);
}
@Post('ppt')
@UseInterceptors(FileInterceptor('file', multerConfigPpt))
createPpt(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
) {
  createMaterisDto.file = file.filename; 
  return this.materisService.create(createMaterisDto);
}
@Post('video')
@UseInterceptors(FileInterceptor('file', multerConfigVideo))
createVideo(
  @Body() createMaterisDto: CreateMaterisDto,
  @UploadedFile() file: Express.Multer.File,
) {
  createMaterisDto.file = file.filename; 
  return this.materisService.create(createMaterisDto);
}

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.materisService.findOne(id);
  }

@Get('/kelas/:kelasId')
findMateriByKelas(@Param('kelasId') kelasId: number){
return this.materisService.findMateriBykelas(kelasId)
}

  @Get(':jenis_file/:kelasId')
  findMateriByJenisFile(@Param('jenis_file') jenis_file: JenisFile, @Param('kelasId') kelasId: number){
    return this.materisService.findIdentityMateri(jenis_file, kelasId)
  }

  // @Get('edit/materi/:id')
  // formEditMateri(@Param('id') id: string) {
  //   return this.materisService.findMateri(+id);
  // }

  @Get('edit/materi/:id')
  formEditMateri(@Param('id') id: number){
    return this.materisService.findOne(id)
  }

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

  @Delete(':id')
  removePdf(@Param('id') id: number) {
    return this.materisService.remove(id);
  }
}
