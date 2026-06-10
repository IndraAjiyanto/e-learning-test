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
import { MisiService } from './misi.service';
import { CreateMisiDto } from './dto/create-misi.dto';
import { UpdateMisiDto } from './dto/update-misi.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response, Request } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('mission')
export class MisiController {
  constructor(private readonly misiService: MisiService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createMisiDto: CreateMisiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createMisiDto.misi_ke = await this.misiService.noPertemuan();
      await this.misiService.create(createMisiDto);
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
    const misi = await this.misiService.findAll();
    res.render('super_admin/misi/index', { user: req.user, misi });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async Formedit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const misi = await this.misiService.findOne(id);
    res.render('super_admin/misi/edit', { user: req.user, misi });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMisiDto: UpdateMisiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.misiService.update(id, updateMisiDto);
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
      await this.misiService.remove(id);
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
