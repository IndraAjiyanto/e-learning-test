import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('mentor')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Roles('admin')
  @Post(':kelasId')
  @UseInterceptors(FileInterceptor('profile', multerConfigImage))
  async create(@Param('kelasId') kelasId: number, @UploadedFile() profile: Express.Multer.File, @Body() createMentorDto: CreateMentorDto, @Res() res:Response, @Req() req:Request) {
    try {
      createMentorDto.kelasId = kelasId
      createMentorDto.profile = profile.path
    await this.mentorService.create(createMentorDto);
    req.flash('success','mentor successfully created')
    res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    } catch (error) {
      console.log(error)
          req.flash('error','mentor failed to create')
    res.redirect(`/kelass/detail/kelas/admin/${kelasId}`)
    }
  }

  @Roles('admin')
  @Get('formCreate/:kelasId')
  async formCreate(@Param('kelasId') kelasId: number, @Res() res:Response, @Req() req:Request) {
    res.render('admin/mentor/create', {user: req.user, kelasId})
  }

  @Roles('admin')
  @Get(':mentorId')
  async findOne(@Param('mentorId') mentorId: number, @Res() res:Response, @Req() req:Request) {
    const mentor = await this.mentorService.findOne(mentorId);
    res.render('admin/mentor/detail', {user: req.user, mentor})
  }

  @Roles('admin')
  @Get('formEdit/:mentorId')
  async formEdit(@Param('mentorId') mentorId: number, @Res() res:Response, @Req() req:Request) {
    const mentor = await this.mentorService.findOne(mentorId);
    res.render('admin/mentor/edit', {user: req.user, mentor})
  }

  @Roles('admin')
  @Patch(':kelasId/:mentorId')
  @UseInterceptors(FileInterceptor('profile', multerConfigImage))
  async update(@Param('mentorId') mentorId: number, @Param('kelasId') kelasId: number, @UploadedFile() profile: Express.Multer.File, @Body() updateMentorDto: UpdateMentorDto, @Res() res:Response, @Req() req:Request) {
    try {
      const mentor = await this.mentorService.findOne(mentorId)
      if(profile){
        updateMentorDto.profile = profile.path
        await this.mentorService.getPublicIdFromUrl(mentor.profile)
      }
      await this.mentorService.update(mentorId, updateMentorDto)
      req.flash('success', 'mentor successfully update')
      res.redirect(`/kelass/${kelasId}`)
    } catch (error) {
      req.flash('error', 'mentor failed to update')
      res.redirect(`/kelass/${kelasId}`)
    }
  }

  @Roles('admin')
  @Delete(':mentorId/:kelasId')
  async remove(@Param('mentorId') mentorId: number, @Param('kelasId') kelasId: number, @Res() res:Response, @Req() req:Request) {
    try {
      const mentor = await this.mentorService.findOne(mentorId)
      if(!mentor){
        req.flash('error', 'mentor not found')
        res.redirect(`/kelass/${kelasId}`)
      }
      await this.mentorService.getPublicIdFromUrl(mentor.profile)
      await this.mentorService.remove(mentorId)
              req.flash('success', 'mentor successfully deleted')
        res.redirect(`/kelass/${kelasId}`)
    } catch (error) {
              req.flash('error', 'mentor failed to delete')
        res.redirect(`/kelass/${kelasId}`)
    }
  }
}
