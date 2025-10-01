import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Res, Req, UploadedFile } from '@nestjs/common';
import { LogbookMentorService } from './logbook_mentor.service';
import { CreateLogbookMentorDto } from './dto/create-logbook_mentor.dto';
import { UpdateLogbookMentorDto } from './dto/update-logbook_mentor.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('logbook-mentor')
export class LogbookMentorController {
  constructor(private readonly logbookMentorService: LogbookMentorService) {}

  @Roles('admin')
  @Post(':pertemuanId')
  @UseInterceptors(FileInterceptor('dokumentasi', multerConfigImage))
  async create(@Param('pertemuanId') pertemuanId:number,@Body() createLogbookMentorDto: CreateLogbookMentorDto, @Res() res:Response, @Req() req:Request, @UploadedFile() dokumentasi: Express.Multer.File) {
    try {
      createLogbookMentorDto.dokumentasi = dokumentasi.path
      createLogbookMentorDto.userId = req.user!.id
      createLogbookMentorDto.pertemuanId = pertemuanId
    await this.logbookMentorService.create(createLogbookMentorDto);
      req.flash('success', 'Log book added successfully');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', 'Log book failed to create');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Get(':logbook_mentorId')
  async findOne(@Param('logbook_mentorId') logbook_mentorId: number, @Res() res:Response, @Req() req:Request) {
    const logbook_mentor = await this.logbookMentorService.findOne(logbook_mentorId);
    res.render('admin/logbook_mentor/detail', {user:req.user, logbook_mentor})
  }

  @Roles('admin')
  @Get('formCreate/:pertemuanId')
  async formCreate(@Param('pertemuanId') pertemuanId: number, @Res() res:Response, @Req() req:Request){
    res.render('admin/logbook_mentor/create', {user: req.user, pertemuanId})
  }

  @Roles('admin')
  @Get('formEdit/:logbook_mentorId')
  async formEdit(@Param('logbook_mentorId') logbook_mentorId: number, @Res() res:Response, @Req() req:Request){
    const logbook_mentor = await this.logbookMentorService.findOne(logbook_mentorId)
    res.render('admin/logbook_mentor/edit', {user:req.user, logbook_mentor})
  }

  @Roles('admin')
  @Patch(':logbook_mentorId')
    @UseInterceptors(FileInterceptor('dokumentasi', multerConfigImage))
  async update(@Param('logbook_mentorId') logbook_mentorId: number, @UploadedFile() dokumentasi: Express.Multer.File, @Body() updateLogbookMentorDto: UpdateLogbookMentorDto, @Res() res:Response, @Req() req:Request) {
    try {
      const logbook = await this.logbookMentorService.findOne(logbook_mentorId)
      if (dokumentasi) {
      await this.logbookMentorService.getPublicIdFromUrl(logbook.dokumentasi);
      updateLogbookMentorDto.dokumentasi = dokumentasi.path;
    } 
    await this.logbookMentorService.update(logbook_mentorId, updateLogbookMentorDto);
    req.flash('success','logbook successfully updated')
    res.redirect(`/logbook-mentor/${logbook_mentorId}`)
    } catch (error) {
      req.flash('error','logbook failed to updated')
      res.redirect(`/logbook-mentor/${logbook_mentorId}`)
    }
  }

  @Roles('admin')
  @Delete(':logbook_mentorId')
  async remove(@Param('logbook_mentorId') logbook_mentorId: number) {
    try {
      await this.logbookMentorService.remove(logbook_mentorId);

    } catch (error) {
      
    }
  }
}
