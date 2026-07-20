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
import { MissionService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response, Request } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createMissionDto: CreateMissionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createMissionDto.mission_order = await this.missionService.noPertemuan();
      await this.missionService.create(createMissionDto);
      req.flash('success', 'misi successfully created');
      res.redirect('/misi');
    } catch (error: any) {
      req.flash('error', 'misi failed to create');
      res.redirect('/misi');
    }
  }

  @Roles('super_admin')
  @Get()
  async index(@Res() res: Response, @Req() req: Request) {
    const mission = await this.missionService.findAll();
    res.render('super_admin/misi/index', { user: req.user, mission });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async Formedit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const mission = await this.missionService.findOne(id);
    res.render('super_admin/misi/edit', { user: req.user, mission });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMissionDto: UpdateMissionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.missionService.update(id, updateMissionDto);
      req.flash('success', 'misi successfully updated');
      res.redirect('/misi');
    } catch (error: any) {
      req.flash('error', 'misi failed to update');
      res.redirect('/misi');
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
      await this.missionService.remove(id);
      req.flash('success', 'misi successfully deleted');
      res.redirect('/misi');
    } catch (error: any) {
      req.flash('error', 'misi failed to delete');
      res.redirect('/misi');
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/misi/create', { user: req.user });
  }
}
