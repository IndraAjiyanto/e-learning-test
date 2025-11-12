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
import { VisiService } from './visi.service';
import { CreateVisiDto as CreateVisiDto } from './dto/create-visi.dto';
import { UpdateVisiDto as UpdateVisiDto } from './dto/update-visi.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('visi')
export class VisiController {
  constructor(private readonly visiService: VisiService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createVisiDto: CreateVisiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      console.log(createVisiDto.visi);
      await this.visiService.create(createVisiDto);

      req.flash('success', 'visi successfully created');
      res.redirect('/visi');
    } catch (error) {
      console.log(error);
      req.flash('error', error.message || 'visi failed to create');
      res.redirect('/visi');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    try {
      const visi = await this.visiService.findAll();
      console.log('Visi data:', visi);
      res.render('super_admin/visi/index', {
        user: req.user,
        visi: visi || [],
      });
    } catch (error) {
      console.log('Error fetching visi:', error);
      res.render('super_admin/visi/index', { user: req.user, visi: [] });
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/visi/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:visiId')
  async findOne(
    @Param('visiId') visiId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const visi = await this.visiService.findOne(visiId);
    res.render('super_admin/visi/edit', { user: req.user, visi });
  }

  @Roles('super_admin')
  @Patch(':visiId')
  async update(
    @Param('visiId') visiId: number,
    @Res() res: Response,
    @Req() req: Request,
    @Body() updateVisiDto: UpdateVisiDto,
  ) {
    try {
      await this.visiService.update(visiId, updateVisiDto);
      req.flash('success', 'visi successfully updated');
      res.redirect('/visi');
    } catch (error) {
      req.flash('error', error.message || 'visi failed to update');
      res.redirect('/visi');
    }
  }

  @Roles('super_admin')
  @Delete(':visiId')
  async remove(
    @Param('visiId') visiId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.visiService.remove(visiId);
      req.flash('success', 'visi successfully remove');
      res.redirect('/visi');
    } catch (error) {
      req.flash('error', error.message || 'visi failed to remove');
      res.redirect('/visi');
    }
  }
}
