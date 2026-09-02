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
  UseFilters,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createSocialDto: CreateSocialDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.socialService.create(createSocialDto);
      req.flash('success', 'Social created successfully');
      res.redirect('/social');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create social');
      res.redirect('/social');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const socials = await this.socialService.findAll();
    res.render('super_admin/social/index', { user: req.user, socials });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/social/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const social = await this.socialService.findOne(id);
    res.render('super_admin/social/edit', { user: req.user, social });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSocialDto: UpdateSocialDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.socialService.update(id, updateSocialDto);
      req.flash('success', 'Social updated successfully');
      res.redirect('/social');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update social');
      res.redirect('/social');
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
      const social = await this.socialService.findOne(id);
      if (!social) {
        req.flash('error', 'Social not found');
        res.redirect('/social');
      }
      await this.socialService.remove(id);
      req.flash('success', 'Social deleted successfully');
      res.redirect('/social');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete social');
      res.redirect('/social');
    }
  }
}
