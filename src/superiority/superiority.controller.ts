import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Redirect,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { SuperiorityService } from './superiority.service';
import { CreateSuperiorityDto } from './dto/create-superiority.dto';
import { UpdateSuperiorityDto } from './dto/update-superiority.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('superiority')
export class SuperiorityController {
  constructor(private readonly superiorityService: SuperiorityService) {}

  @Roles('super_admin')
  @Get('formCreate/:kategoriId')
  async formCreate(
    @Param('kategoriId') kategoriId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('super_admin/superiority/create', {
      user: req.user,
      kategoriId,
    });
  }

  @Roles('super_admin')
  @Post(':kategoriId')
  async createFromForm(
    @Body() createSuperiorityDto: CreateSuperiorityDto,
    @Param('kategoriId') kategoriId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createSuperiorityDto.kategoriId = kategoriId;
      await this.superiorityService.create(createSuperiorityDto);
      req.flash('success', 'superiority successfully created');
      res.redirect('/kategoris/' + kategoriId);
    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to create superiority');
      res.redirect('/kategoris/' + kategoriId);
    }
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const superiority = await this.superiorityService.findOne(id);
    res.render('super_admin/superiority/edit', { superiority, user: req.user });
  }

  @Roles('super_admin')
  @Patch('formEdit/:id/:kategoriId')
  async updateFromForm(
    @Param('id') id: number,
    @Param('kategoriId') kategoriId: number,
    @Body() updateSuperiorityDto: UpdateSuperiorityDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.superiorityService.update(id, updateSuperiorityDto);
      req.flash('success', 'Superiority successfully updated');
      res.redirect('/kategoris/' + kategoriId);
    } catch (error) {
      req.flash('error', 'Failed to update superiority');
      res.redirect('/kategoris/' + kategoriId);
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
      await this.superiorityService.remove(id);
      req.flash('success', 'Superiority successfully deleted');
      res.redirect('/kategoris');
    } catch (error) {
      req.flash('error', 'Failed to delete superiority');
      res.redirect('/kategoris');
    }
  }
}
