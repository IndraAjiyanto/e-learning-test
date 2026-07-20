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
} from '@nestjs/common';
import { VisionsService } from './visions.service';
import { CreateVisionsDto as CreateVisionsDto } from './dto/create-vision.dto';
import { UpdateVisionsDto as UpdateVisionsDto } from './dto/update-vision.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('vision')
export class VisionsonController {
  constructor(private readonly visionService: VisionsService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createVisionDto: CreateVisionsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.visionService.create(createVisionDto);

      req.flash('success', 'visi successfully created');
      res.redirect('/vision');
    } catch (error: any) {
      req.flash('error', error.message || 'vision failed to create');
      res.redirect('/vision');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const vision = await this.visionService.findAll();
    res.render('super_admin/visi/index', {
      user: req.user,
      vision,
    });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/visi/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:visiId')
  async findOne(
    @Param('visionId') visionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const vision = await this.visionService.findOne(visionId);
    res.render('super_admin/visi/edit', { user: req.user, vision });
  }

  @Roles('super_admin')
  @Patch(':visionId')
  async update(
    @Param('visionId') visionId: number,
    @Res() res: Response,
    @Req() req: Request,
    @Body() updateVisionDto: UpdateVisionsDto,
  ) {
    try {
      await this.visionService.update(visionId, updateVisionDto);
      req.flash('success', 'visi successfully updated');
      res.redirect('/vision');
    } catch (error: any) {
      req.flash('error', error.message || 'visi failed to update');
      res.redirect('/vision');
    }
  }

  @Roles('super_admin')
  @Delete(':visionId')
  async remove(
    @Param('visionId') visionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.visionService.remove(visionId);
      req.flash('success', 'visi successfully remove');
      res.redirect('/vision');
    } catch (error: any) {
      req.flash('error', error.message || 'visi failed to remove');
      res.redirect('/vision');
    }
  }
}
