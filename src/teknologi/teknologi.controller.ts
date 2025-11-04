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
import { TeknologiService } from './teknologi.service';
import { CreateTeknologiDto } from './dto/create-teknologi.dto';
import { UpdateTeknologiDto } from './dto/update-teknologi.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('teknologi')
export class TeknologiController {
  constructor(private readonly teknologiService: TeknologiService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createTeknologiDto: CreateTeknologiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.teknologiService.create(createTeknologiDto);
      req.flash('success', 'Teknologi successfully created');
      res.redirect('/teknologi');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Teknologi failed to create');
      res.redirect('/teknologi');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const teknologi = await this.teknologiService.findAll();
    res.render('super_admin/teknologi/index', { user: req.user, teknologi });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/teknologi/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const teknologi = await this.teknologiService.findOne(id);
    res.render('super_admin/teknologi/edit', { user: req.user, teknologi });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTeknologiDto: UpdateTeknologiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.teknologiService.update(id, updateTeknologiDto);
      req.flash('success', 'Teknologi successfully updated');
      res.redirect('/teknologi');
    } catch (error) {
      req.flash('error', 'Teknologi failed to update');
      res.redirect('/teknologi');
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
      const teknologi = await this.teknologiService.findOne(id);
      if (!teknologi) {
        req.flash('error', 'Teknologi not found');
        res.redirect('/teknologi');
      }
      await this.teknologiService.remove(id);
      req.flash('success', 'Teknologi successfully deleted');
      res.redirect('/teknologi');
    } catch (error) {
      req.flash('error', 'Failed to delete teknologi');
      res.redirect('/teknologi');
    }
  }
}
