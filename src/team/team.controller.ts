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
  UploadedFile,
  UseFilters,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  createMemoryConfig,
  multerConfigMemory,
} from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 500,
    minHeight: 300,
    maxHeight: 500,
    maxSize: 1 * 1024 * 1024, // 1MB max
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'nestjs/images/profile',
  })
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @Res() res: Response,
    @Req() req: Request,
    @UploadedFile() profile: Express.Multer.File,
  ) {
    try {
      createTeamDto.profile = req.body.uploadedImageUrls?.[0];
        createTeamDto.team_ke = await this.teamService.noPertemuan()

      await this.teamService.create(createTeamDto);
      req.flash('success', 'team successfully created');
      res.redirect('/team');
    } catch (error) {
      req.flash('error', 'team failed to create');
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
    @Param('teamId') teamId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const team = await this.teamService.findOne(teamId);
    res.render('super_admin/team/edit', { user: req.user, team });
  }

  @Roles('super_admin')
  @Patch(':teamId')
  @UseInterceptors(
    FileInterceptor(
      'profile',
      createMemoryConfig({ fileTypes: ['image'], maxSize: 5 }),
    ),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 300,
    maxWidth: 500,
    minHeight: 300,
    maxHeight: 500,
    folder: 'nestjs/images/profile',
  })
  async update(
    @UploadedFile() profile: Express.Multer.File,
    @Param('teamId') teamId: number,
    @Body() updateTeamDto: UpdateTeamDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const team = await this.teamService.findOne(teamId);
      if (profile) {
        await this.teamService.getPublicIdFromUrl(team.profile);
        updateTeamDto.profile = req.body.uploadedImageUrls?.[0];
      }
      await this.teamService.update(teamId, updateTeamDto);
      req.flash('success', 'team successfully updated');
      res.redirect('/team');
    } catch (error) {
      req.flash('error', 'team failed to update');
      res.redirect('/team');
    }
  }

  @Roles('super_admin')
  @Delete(':teamId')
  async remove(
    @Param('teamId') teamId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const team = await this.teamService.findOne(teamId);
      await this.teamService.getPublicIdFromUrl(team.profile);
      await this.teamService.remove(teamId);
      req.flash('success', 'team successfully deleted');
      res.redirect('/team');
    } catch (error) {
      req.flash('error', 'team failed to delete');
      res.redirect('/team');
    }
  }
}
