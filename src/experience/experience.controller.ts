import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response, Request } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createExperienceDto: CreateExperienceDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createExperienceDto.experience_ke =
        await this.experienceService.noExperience();
      await this.experienceService.create(createExperienceDto);
      req.flash('success', 'experience successfully created');
      res.redirect('/experience');
    } catch (error: any) {
      req.flash('error', 'experience failed to create');
      res.redirect('/experience');
    }
  }

  @Roles('super_admin')
  @Get()
  async index(@Res() res: Response, @Req() req: Request) {
    const experience = await this.experienceService.findAll();
    res.render('super_admin/experience/index', { user: req.user, experience });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const experience = await this.experienceService.findOne(id);
    res.render('super_admin/experience/edit', { user: req.user, experience });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateExperienceDto: UpdateExperienceDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.experienceService.update(id, updateExperienceDto);
      req.flash('success', 'experience successfully updated');
      res.redirect('/experience');
    } catch (error: any) {
      req.flash('error', 'experience failed to update');
      res.redirect('/experience');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.experienceService.remove(id);
      req.flash('success', 'experience successfully deleted');
      res.redirect('/experience');
    } catch (error: any) {
      req.flash('error', 'experience failed to delete');
      res.redirect('/experience');
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/experience/create', { user: req.user });
  }
}
