import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TugassService } from './tugass.service';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigPdf } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('tugass')
export class TugassController {
  constructor(private readonly tugassService: TugassService) {}

  @Roles('user', 'admin')
  @Post(':pertemuanId')
  @UseInterceptors(FileInterceptor('file', multerConfigPdf)) 
  async create(@Body() createTugassDto: CreateTugassDto, @UploadedFile() file: Express.Multer.File, @Param('pertemuanId') pertemuanId: number, @Res() res:Response, @Req() req:Request) {
    try {
          createTugassDto.pertemuanId = pertemuanId
    createTugassDto.file = file.path
    createTugassDto.nilai = 0
    await this.tugassService.create(createTugassDto);
    req.flash('success', 'submission successfuly create')
    res.redirect(`/pertemuans/${pertemuanId}`)
    } catch (error) {
      console.log(error)
      req.flash('error', 'submission unsecces create')
    res.redirect(`/pertemuans/${pertemuanId}`)
    }

  }

  @Get('formCreate/:pertemuanId')
  async formCreate(@Res() res:Response, @Req() req:Request, @Param('pertemuanId') pertemuanId: number){
    res.render('admin/tugas/create', {user: req.user, pertemuanId})
  }


  @Get()
  findAll() {
    return this.tugassService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tugassService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTugassDto: UpdateTugassDto) {
    return this.tugassService.update(+id, updateTugassDto);
  }

  @Roles('admin')
  @Delete(':tugasId/:pertemuanId')
  async remove(@Param('pertemuanId') pertemuanId: number, @Param('tugasId') tugasId: number, @Req() req:Request, @Res() res:Response) {
    try {
    await this.tugassService.remove(tugasId);
      req.flash('success', 'successfuly delete assignment')
    res.redirect(`/pertemuans/${pertemuanId}`)
    } catch (error) {
      req.flash('error', 'unsuccess delete assignment')
      console.log(error)
    res.redirect(`/pertemuans/${pertemuanId}`)
    }
  }
}
