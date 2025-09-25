import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards, Res, Req } from '@nestjs/common';
import { MaterisService } from './materis.service';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import cloudinary, { multerConfigPdf, multerConfigPpt, multerConfigVideo } from 'src/common/config/multer.config';
import { JenisFile } from 'src/entities/materi.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Request, Response } from 'express';
import { join } from 'path';
const spire = require('spire.presentation').default;
import { promises as fs } from 'fs';
import { ConvertApiService } from 'src/common/config/convertapi.service';

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
      createMaterisDto.file = file.path;
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
  @Req() req: Request,
) {
  try {
    // Validasi file
    if (!file) {
      req.flash('error', 'No file uploaded');
      return res.redirect(`/pertemuans/${pertemuanId}`);
    }

    // Validasi format file
    const allowedMimeTypes = [
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      req.flash('error', 'Invalid file format. Only PPT and PPTX are allowed');
      return res.redirect(`/pertemuans/${pertemuanId}`);
    }

    // 1️⃣ Simpan file sementara dengan ekstensi yang benar
    const tmpDir = join(process.cwd(), 'tmp');
    await fs.mkdir(tmpDir, { recursive: true });
    
    // Pastikan ekstensi file benar
    const fileExtension = file.originalname.toLowerCase().endsWith('.pptx') ? '.pptx' : '.ppt';
    const tmpFileName = `ppt-${Date.now()}${fileExtension}`;
    const tmpPath = join(tmpDir, tmpFileName);
    await fs.writeFile(tmpPath, file.buffer);

    // 2️⃣ Convert PPTX → PNG (dengan error handling yang lebih baik)
    const slideOutputDir = join(process.cwd(), 'tmp', `slides-${Date.now()}`);
    let slidePaths: string[] = [];
    
    try {
      slidePaths = await this.convertApiService.pptToPng(tmpPath, slideOutputDir);
    } catch (convertError) {
      await fs.unlink(tmpPath); // cleanup
      req.flash('error', 'Failed to convert PPT to images');
      return res.redirect(`/pertemuans/${pertemuanId}`);
    }

    // 3️⃣ Upload slide PNG ke Cloudinary dengan batch processing
    const slideUrls: string[] = [];
    const uploadPromises = slidePaths.map(async (slidePath, index) => {
      try {
        const uploadedSlide = await cloudinary.uploader.upload(slidePath, {
          folder: 'nestjs/ppt/slides',
          public_id: `slide-${pertemuanId}-${Date.now()}-${index}`,
          resource_type: 'image'
        });
        return uploadedSlide.secure_url;
      } catch (uploadError) {
        console.error(`Failed to upload slide ${index}:`, uploadError);
        return null;
      } finally {
        // Hapus file lokal slide
        try {
          await fs.unlink(slidePath);
        } catch (unlinkError) {
          console.error(`Failed to delete slide file ${slidePath}:`, unlinkError);
        }
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    slideUrls.push(...uploadResults.filter(url => url !== null));

    if (slideUrls.length === 0) {
      await fs.unlink(tmpPath);
      req.flash('error', 'Failed to upload slide images');
      return res.redirect(`/pertemuans/${pertemuanId}`);
    }

    // 4️⃣ Upload file PPT asli ke Cloudinary
    const cloudFile = await cloudinary.uploader.upload(tmpPath, {
      folder: 'nestjs/ppt',
      public_id: `materi-${pertemuanId}-${Date.now()}`,
      resource_type: 'raw' // Penting untuk file non-image
    });

    // 5️⃣ Simpan ke database dengan slide URLs
    createMaterisDto.file = cloudFile.secure_url;
    createMaterisDto.pertemuanId = pertemuanId;
    createMaterisDto.jenis_file = 'ppt';
    createMaterisDto.slides = slideUrls;
    // Tambahkan slide URLs ke DTO jika ada field untuk itu
    // createMaterisDto.slideUrls = slideUrls;

    const savedMateri = await this.materisService.create(createMaterisDto);

    // 6️⃣ Cleanup file sementara
    try {
      await fs.unlink(tmpPath);
      // Cleanup slide directory jika masih ada
      try {
        await fs.rmdir(slideOutputDir);
      } catch (rmdirError) {
        console.error('Failed to remove slide directory:', rmdirError);
      }
    } catch (unlinkError) {
      console.error('Failed to cleanup temp file:', unlinkError);
    }

    req.flash('success', `Successfully created PPT with ${slideUrls.length} slides`);
    res.redirect(`/pertemuans/${pertemuanId}`);

  } catch (error) {
    console.error('PPT upload error:', error);
    req.flash('error', 'Failed to create materi PPT');
    res.redirect(`/pertemuans/${pertemuanId}`);
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
      createMaterisDto.file = file.path
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
    res.render('materi/ppt', { user: req.user, materi, pertemuan})
    }
  }

  @Roles('admin')
  @Get('formCreate/:jenis_file/:pertemuanId')
  async formEditMateri(@Param('pertemuanId') pertemuanId: number, @Param('jenis_file') jenis_file: string, @Req() req:Request, @Res() res:Response ){
    res.render('admin/materi/create', {user:  req.user, pertemuanId, jenis_file})
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
    await this.materisService.getPublicIdFromUrl(materi.file);
    updateMaterisDto.file = file.path; 
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
    await this.materisService.getPublicIdFromUrl(materi.file);
    updateMaterisDto.file = file.path; 
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
    await this.materisService.getPublicIdFromUrl(materi.file);
    updateMaterisDto.file = file.path; 
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
