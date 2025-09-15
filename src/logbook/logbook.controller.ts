import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Res, Req } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('logbook')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Roles('admin', 'user')
  @Post(':kelasId')
    @UseInterceptors(FileInterceptor('dokumentasi', multerConfigImage))
  async create(@Param('kelasId') kelasId:number,@Body() createLogbookDto: CreateLogbookDto, @UploadedFile() dokumentasi: Express.Multer.File, @Res() res:Response, @Req() req:Request) {
    try {
      createLogbookDto.dokumentasi = dokumentasi.path
      createLogbookDto.userId = req.user!.id
      createLogbookDto.kelasId = kelasId
      await this.logbookService.create(createLogbookDto);
      req.flash('success', 'Log book added successfully');
      res.redirect('/logbook');
    } catch (error) {
      console.log(createLogbookDto)
      req.flash('error', 'Failed to add log book');
      res.redirect('/logbook');
    }
  }

  @Roles('admin', 'user')
  @Post()
    @UseInterceptors(FileInterceptor('dokumentasi', multerConfigImage))
  async createLogBook(@Body() createLogbookDto: CreateLogbookDto, @UploadedFile() dokumentasi: Express.Multer.File, @Res() res:Response, @Req() req:Request) {
    try {

      createLogbookDto.dokumentasi = dokumentasi.path
      createLogbookDto.userId = req.user!.id
      await this.logbookService.create(createLogbookDto);
      req.flash('success', 'Log book added successfully');
      res.redirect('/logbook');
    } catch (error) {
      console.log(error)
      req.flash('error', 'Failed to add log book');
      res.redirect('/logbook');
    }
  }

  @Roles('user', 'admin')
  @Get()
  async findLogBook(@Req() req:Request, @Res() res:Response) {
      if(req.user!.role === "admin"){
                    const logbook = await this.logbookService.findAll();
    res.render('admin/logbook/index', { logbook, user: req.user });
      } else if (req.user!.role === "user"){
            const logbook = await this.logbookService.findByUser(req.user!.id);
    res.render('user/logbook/index', { logbook, user: req.user });
      }
  }

  @Roles('user')
  @Get('formCreate')
  async formCreate(@Req() req:Request, @Res() res:Response){
    const kelas = await this.logbookService.findKelasByUser(req.user!.id);
    res.render('user/logbook/create', { user: req.user, kelas });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logbookService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogbookDto: UpdateLogbookDto) {
    return this.logbookService.update(+id, updateLogbookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logbookService.remove(+id);
  }
}
