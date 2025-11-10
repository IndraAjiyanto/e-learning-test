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
import { BulanService } from './bulan.service';
import { CreateBulanDto } from './dto/create-bulan.dto';
import { UpdateBulanDto } from './dto/update-bulan.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('bulan')
export class BulanController {
  constructor(private readonly bulanService: BulanService) {}

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const bulan = await this.bulanService.findAll();
    res.render('super_admin/bulan/index', { user: req.user, bulan });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/bulan/create', { user: req.user });
  }

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createBulanDto: CreateBulanDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.bulanService.create(createBulanDto);
      req.flash('success', 'Bulan successfully created');
      res.redirect('/bulan');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Bulan failed to create');
      res.redirect('/bulan');
    }
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const bulan = await this.bulanService.findOne(id);
    res.render('super_admin/bulan/edit', { user: req.user, bulan });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBulanDto: UpdateBulanDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.bulanService.update(id, updateBulanDto);
      req.flash('success', 'Bulan successfully updated');
      res.redirect('/bulan');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Bulan failed to update');
      res.redirect('/bulan');
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
      await this.bulanService.remove(id);
      req.flash('success', 'Bulan successfully removed');
      res.redirect('/bulan');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Bulan failed to remove');
      res.redirect('/bulan');
    }
  }
}
