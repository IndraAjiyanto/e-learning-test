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
import { flashToast } from 'src/common/utils/toast.util';

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
      createExperienceDto.experienceOrder =
        await this.experienceService.noExperience();
      await this.experienceService.create(createExperienceDto);
      flashToast(
        req,
        'Experience Created',
        'The experience has been added successfully.',
      );
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
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const experience = await this.experienceService.findOne(id);
    res.render('super_admin/experience/edit', { user: req.user, experience });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.experienceService.update(id, updateExperienceDto);
      flashToast(
        req,
        'Changes Saved',
        'The experience has been updated successfully.',
      );
      res.redirect('/experience');
    } catch (error: any) {
      req.flash('error', 'experience failed to update');
      res.redirect('/experience');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.experienceService.remove(id);
      flashToast(
        req,
        'Experience Deleted',
        'The experience has been removed successfully.',
      );
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
