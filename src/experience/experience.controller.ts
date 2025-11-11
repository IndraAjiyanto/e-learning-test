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

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Post()
  async create(
    @Body() createExperienceDto: CreateExperienceDto,
    @Res() res: Response,
  ) {
    await this.experienceService.create(createExperienceDto);
    res.redirect('/experience');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get()
  async index(@Res() res: Response, @Req() req: Request) {
    const experiences = await this.experienceService.findAll();
    res.render('super_admin/experience/index', { user: req.user, experiences });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get(':id/edit')
  async edit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const experience = await this.experienceService.findOne(+id);
    res.render('super_admin/experience/edit', { user: req.user, experience });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
    @Res() res: Response,
  ) {
    await this.experienceService.update(+id, updateExperienceDto);
    res.redirect('/experience');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.experienceService.remove(+id);
    res.redirect('/experience');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get('formCreate')
  formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/experience/create', { user: req.user });
  }
}
