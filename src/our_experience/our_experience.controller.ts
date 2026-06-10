import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { OurExperienceService } from './our_experience.service';
import { CreateOurExperienceDto } from './dto/create-our_experience.dto';
import { UpdateOurExperienceDto } from './dto/update-our_experience.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('our_experience')
export class OurExperienceController {
  constructor(private readonly ourExperienceService: OurExperienceService) {}

  @Roles('super_admin')
  @Get()
  async index(@Req() req: Request, @Res() res: Response) {
    const ourExperiences = await this.ourExperienceService.findAll();
    res.render('super_admin/our_experience/index', {
      ourExperiences,
      user: req.user,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Req() req: Request, @Res() res: Response) {
    res.render('super_admin/our_experience/create', { user: req.user });
  }

  @Roles('super_admin')
  @Post()
  async createFromForm(
    @Body() createOurExperienceDto: CreateOurExperienceDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.ourExperienceService.create(createOurExperienceDto);
      req.flash('success', 'Our experience successfully created');
      res.redirect('/our_experience');
    } catch (error: any) {
      req.flash('error', 'Failed to create our experience');
      res.redirect('/our_experience');
    }
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ourExperience = await this.ourExperienceService.findOne(id);
    res.render('super_admin/our_experience/edit', {
      ourExperience,
      user: req.user,
    });
  }

  @Roles('super_admin')
  @Patch('formEdit/:id')
  async updateFromForm(
    @Param('id') id: number,
    @Body() updateOurExperienceDto: UpdateOurExperienceDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.ourExperienceService.update(id, updateOurExperienceDto);
      req.flash('success', 'Our experience successfully updated');
      res.redirect('/our_experience');
    } catch (error: any) {
      req.flash('error', 'Failed to update our experience');
      res.redirect('/our_experience');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async deleteFromForm(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.ourExperienceService.remove(id);
      req.flash('success', 'Our experience successfully deleted');
      res.redirect('/our_experience');
    } catch (error: any) {
      req.flash('error', 'Failed to delete our experience');
      res.redirect('/our_experience');
    }
  }
}
