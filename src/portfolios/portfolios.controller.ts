import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import cloudinary, { multerConfigImage } from 'src/common/config/multer.config';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePortfolioDto: UpdatePortfolioDto) {
    return this.portfoliosService.update(+id, updatePortfolioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfoliosService.remove(+id);
  }
}
