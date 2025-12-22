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
import { TeamLeadService } from './team_lead.service';
import { CreateTeamLeadDto } from './dto/create-team_lead.dto';
import { UpdateTeamLeadDto } from './dto/update-team_lead.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  createMemoryConfig,
  multerConfigMemory,
  multerConfigMemoryOnly,
} from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('team-lead')
export class TeamLeadController {
  constructor(private readonly teamLeadService: TeamLeadService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024, // 1MB max
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'profile_teamLead',
  })
  async create(
    @Body() createTeamLeadDto: CreateTeamLeadDto,
    @Res() res: Response,
    @Req() req: Request,
    @UploadedFile() profile: Express.Multer.File,
  ) {
    try {
      createTeamLeadDto.profile = req.body.uploadedImageUrls?.[0];
      await this.teamLeadService.create(createTeamLeadDto);
      req.flash('success', 'Team Lead created successfully');
      res.redirect('/team-lead');
    } catch (error) {
      req.flash('error', error.message || 'Failed to create Team Lead');
      res.redirect('/team-lead');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const teamLeads = await this.teamLeadService.findAll();
    res.render('super_admin/team_lead/index', { user: req.user, teamLeads });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/team_lead/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const teamLead = await this.teamLeadService.findOne(id);
    res.render('super_admin/team_lead/edit', { user: req.user, teamLead });
  }

  @Roles('super_admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('profile', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024, // 1MB max
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'profile_teamLead',
  })
  async update(
    @UploadedFile() profile: Express.Multer.File,
    @Param('id') id: number,
    @Body() updateTeamLeadDto: UpdateTeamLeadDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const teamLead = await this.teamLeadService.findOne(id);
      if (profile) {
        await this.teamLeadService.deleteFile(teamLead.profile);
        updateTeamLeadDto.profile = req.body.uploadedImageUrls?.[0];
      }
      await this.teamLeadService.update(id, updateTeamLeadDto);
      req.flash('success', 'Team Lead updated successfully');
      res.redirect('/team-lead');
    } catch (error) {
      req.flash('error', error.message || 'Failed to update Team Lead');
      res.redirect('/team-lead');
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
      const teamLead = await this.teamLeadService.findOne(id);
      if (!teamLead) {
        req.flash('error', 'Team Lead not found');
        res.redirect('/team-lead');
      }
      await this.teamLeadService.deleteFile(teamLead.profile);
      await this.teamLeadService.remove(id);
      req.flash('success', 'Team Lead deleted successfully');
      res.redirect('/team-lead');
    } catch (error) {
      req.flash('error', error.message || 'Failed to delete Team Lead');
      res.redirect('/team-lead');
    }
  }
}
