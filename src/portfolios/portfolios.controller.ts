import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { multerConfigImage } from 'src/common/config/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthenticatedGuard)
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Roles('user')
  @Post(':kelasId')
  @UseInterceptors(FilesInterceptor('gambar', 100 ,multerConfigImage)) 
  async create(@UploadedFiles() gambar: Express.Multer.File[], @Param('kelasId') kelasId: number, @Body() createPortfolioDto: CreatePortfolioDto, @Res() res:Response, @Req() req:Request) {
    try {
      createPortfolioDto.kelasId = kelasId
      createPortfolioDto.gambar = gambar.map((file) => file.path);
      if(req.user){
          createPortfolioDto.userId = req.user.id
      }
    await this.portfoliosService.create(createPortfolioDto);
    req.flash('success', 'portofolio successfully upload')
    res.redirect(`/kelass/${kelasId}`);
    } catch (error) {
      req.flash('error', 'Failed to upload portofolio');
      res.redirect(`/kelass/${kelasId}`);
    }
  }

  
@Get()
async findAll(@Req() req:Request, @Res() res:Response){
  const portfolio = await this.portfoliosService.findAll()
  const kategori = await this.portfoliosService.findKategori()
  const jenis_kelas = await this.portfoliosService.findJenisKelas()
  res.render('portfolio', {user: req.user, portfolio, kategori, jenis_kelas})
}


@Roles('user')
@Get('myportfolio/:userId')
async myPortfolio(@Req() req:Request, @Res() res:Response, @Param('userId') userId: number){
  const portfolio = await this.portfoliosService.findByUser(userId)
    res.render('user/myportfolio', {user: req.user, portfolio})
}


  @Roles('user')
  @Get('formCreate/:kelasId')
  async formCreate(@Param('kelasId') kelasId: number, @Req() req:Request, @Res() res:Response) {
    res.render('user/portofolio/create', {user: req.user, kelasId})
  }

  @Roles('user')
  @Get(':portofolioId')
  async findOne(@Param('portofolioId') portofolioId: number, @Res() res:Response, @Req() req:Request) {
    const portfolio = await this.portfoliosService.findOne(portofolioId)
    res.render('user/portofolio/detail', {user: req.user, portfolio})
  }

  @Roles('user')
  @Get('formEdit/:portfolioId')
  async formEdit(@Param('portfolioId') portfolioId: number, @Res() res:Response, @Req() req:Request){
    const portfolio = await this.portfoliosService.findOne(portfolioId)
    res.render('user/portofolio/edit', {user: req.user, portfolio})
  }

@Roles('user')
@Patch(':portfolioId')
@UseInterceptors(FilesInterceptor('gambar', 10, multerConfigImage)) 
async update(
  @UploadedFiles() newGambar: Express.Multer.File[], 
  @Param('portfolioId') portfolioId: number, 
  @Body() updatePortfolioDto: any, // Ubah jadi any untuk fleksibilitas
  @Res() res: Response, 
  @Req() req: Request
) {
  try {
    const oldPortfolio = await this.portfoliosService.findOne(portfolioId);
    
    // Ambil gambar lama yang masih ada di form (tidak dihapus user)
    // updatePortfolioDto.gambar berisi array gambar lama yang tidak di-X
    const remainingOldImages = updatePortfolioDto.gambar || [];
    
    // Pastikan remainingOldImages adalah array
    const oldImagesArray = Array.isArray(remainingOldImages) 
      ? remainingOldImages 
      : [remainingOldImages];

    // Cari gambar lama yang dihapus (ada di database tapi tidak ada di form)
    const originalImages = oldPortfolio.gambar || [];
    const deletedImages = originalImages.filter(url => !oldImagesArray.includes(url));
    
    // Hapus gambar yang dihapus user dari Cloudinary
    if (deletedImages.length > 0) {
      const deletePromises = deletedImages.map(url => 
        this.portfoliosService.getPublicIdFromUrl(url).catch(error => {
          console.log(`Failed to delete removed image ${url}:`, error);
        })
      );
      await Promise.allSettled(deletePromises);
      console.log(`Deleted ${deletedImages.length} removed images`);
    }

    // Gabungkan gambar lama yang masih ada + gambar baru
    let finalGambar = [...oldImagesArray];
    
    if (newGambar && newGambar.length > 0) {
      const newImagePaths = newGambar.map(file => file.path);
      finalGambar = [...finalGambar, ...newImagePaths];
    }

    // Validasi total gambar tidak melebihi batas maksimal
    if (finalGambar.length > 10) {
      // Jika melebihi batas, hapus gambar baru yang baru saja diupload
      if (newGambar && newGambar.length > 0) {
        const deleteNewImagesPromises = newGambar.map(file => 
          this.portfoliosService.getPublicIdFromUrl(file.path).catch(err => {
            console.log(`Failed to cleanup new image ${file.path}:`, err);
          })
        );
        await Promise.allSettled(deleteNewImagesPromises);
      }
      
      req.flash('error', `Maximum 10 images allowed. You currently have ${oldImagesArray.length} images.`);
      return res.redirect(`/portfolios/${portfolioId}/edit`);
    }

    // Siapkan data untuk update
    const updateData = {
      judul: updatePortfolioDto.judul,
      deskripsi: updatePortfolioDto.deskripsi,
      teknologi: updatePortfolioDto.teknologi,
      gambar: finalGambar
    };

    await this.portfoliosService.update(portfolioId, updateData);

    req.flash('success', 'Portfolio successfully updated');
    return res.redirect(`/portfolios/${portfolioId}`);
  } catch (error) {
    console.log('Portfolio update error:', error);
    
    // Jika ada gambar baru yang sudah terupload tapi update gagal, hapus gambar baru tersebut
    if (newGambar && newGambar.length > 0) {
      const deleteNewImagesPromises = newGambar.map(file => 
        this.portfoliosService.getPublicIdFromUrl(file.path).catch(err => {
          console.log(`Failed to cleanup new image ${file.path}:`, err);
        })
      );
      await Promise.allSettled(deleteNewImagesPromises);
    }
    
    req.flash('error', 'Portfolio failed to update');
    return res.redirect(`/portfolios/${portfolioId}/edit`);
  }
}


  @Roles('user')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.portfoliosService.remove(+id);
  }
}
