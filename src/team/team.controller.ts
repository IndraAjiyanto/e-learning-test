import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'profile_team',
  })
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createTeamDto.profile = req.body.uploadedImageUrls?.[0];
      createTeamDto.teamOrder = await this.teamService.getNextOrder();

      await this.teamService.create(createTeamDto);
      flashToast(
        req,
        'Team Member Created',
        'The new team member has been added.',
      );
      res.redirect('/team');
    } catch (error: any) {
      await this.teamService.deleteFile(req.body.uploadedImageUrls?.[0]);
      req.flash('error', error.message || 'Failed to create team member');
      res.redirect('/team');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const team = await this.teamService.findAll();
    res.render('super_admin/team/index', { user: req.user, team });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/team/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:teamId')
  async findOne(
    @Param('teamId') teamId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const team = await this.teamService.findOne(teamId);
    res.render('super_admin/team/edit', { user: req.user, team });
  }

  @Roles('super_admin')
  @Patch(':teamId')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'profile_team',
  })
  async update(
    @Param('teamId') teamId: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const team = await this.teamService.findOne(teamId);
      const newProfile = req.body.uploadedImageUrls?.[0];
      if (newProfile) updateTeamDto.profile = newProfile;
      await this.teamService.update(teamId, updateTeamDto);
      if (newProfile) await this.teamService.deleteFile(team.profile);
      flashToast(req, 'Changes Saved', 'The team member has been updated.');
      res.redirect('/team');
    } catch (error: any) {
      await this.teamService.deleteFile(req.body.uploadedImageUrls?.[0]);
      req.flash('error', error.message || 'Failed to update team member');
      res.redirect('/team');
    }
  }

  @Roles('super_admin')
  @Delete(':teamId')
  async remove(
    @Param('teamId') teamId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const team = await this.teamService.findOne(teamId);
      await this.teamService.deleteFile(team.profile);
      await this.teamService.remove(teamId);
      flashToast(
        req,
        'Team Member Deleted',
        'The team member has been permanently removed.',
      );
      res.redirect('/team');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete team member');
      res.redirect('/team');
    }
  }
}
