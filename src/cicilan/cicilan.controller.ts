import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CicilanService } from './cicilan.service';
import { CreateCicilanDto } from './dto/create-cicilan.dto';
import { UpdateCicilanDto } from './dto/update-cicilan.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@UseGuards(AuthenticatedGuard)
@Controller('cicilan')
export class CicilanController {
  constructor(private readonly cicilanService: CicilanService) {}

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Req() req: Request, @Res() res: Response) {
    const kelas = await this.cicilanService.getAllKelas();
    res.render('super_admin/cicilan/create', { user: req.user, kelas });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const cicilan = await this.cicilanService.findOne(+id);
    const kelas = await this.cicilanService.getAllKelas();
    res.render('super_admin/cicilan/edit', { user: req.user, cicilan, kelas });
  }

  @Roles('super_admin')
  @Post(':kelasId')
  async create(
    @Body() createCicilanDto: CreateCicilanDto,
    @Req() req: Request,
    @Res() res: Response,
    @Param('kelasId') kelasId: number,
  ) {
    try {
      createCicilanDto.kelasId = kelasId;
      await this.cicilanService.create(createCicilanDto);
      req.flash('success', 'Cicilan created successfully');
      res.redirect('/cicilan');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to create cicilan');
      res.redirect('/cicilan');
    }
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCicilanDto: UpdateCicilanDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.cicilanService.update(id, updateCicilanDto);
      req.flash('success', 'Cicilan updated successfully');
      res.redirect('/cicilan');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to update cicilan');
      res.redirect('/cicilan');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.cicilanService.remove(+id);
      req.flash('success', 'Cicilan deleted successfully');
      res.redirect('/cicilan');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to delete cicilan');
      res.redirect('/cicilan');
    }
  }
}
