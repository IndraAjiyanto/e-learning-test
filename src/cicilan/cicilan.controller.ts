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
  @Get('formCreate/:kelasId')
  async formCreate(
    @Req() req: Request,
    @Res() res: Response,
    @Param('kelasId') kelasId: number,
  ) {
    res.render('super_admin/cicilan/create', { user: req.user, kelasId });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const cicilan = await this.cicilanService.findOne(id);
    res.render('super_admin/cicilan/edit', { user: req.user, cicilan });
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
      // Convert harga array from string to number
      if (createCicilanDto.harga && Array.isArray(createCicilanDto.harga)) {
        createCicilanDto.harga = createCicilanDto.harga.map((h) => Number(h));
      }

      // Convert dp to number if present (down payment)
      if (createCicilanDto.dp !== undefined) {
        createCicilanDto.dp = Number(createCicilanDto.dp);
      }

      createCicilanDto.kelasId = Number(kelasId);
      createCicilanDto.bulan = Number(createCicilanDto.bulan) as 3 | 6 | 12;

      await this.cicilanService.create(createCicilanDto);
      req.flash('success', 'Cicilan created successfully');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      console.log(error);
      req.flash('error', error.message || 'Failed to create cicilan');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
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
      // Convert harga array from string to number
      if (updateCicilanDto.harga && Array.isArray(updateCicilanDto.harga)) {
        updateCicilanDto.harga = updateCicilanDto.harga.map((h) => Number(h));
      }

      // Convert dp to number if present
      if (updateCicilanDto.dp !== undefined) {
        updateCicilanDto.dp = Number(updateCicilanDto.dp);
      }

      if (updateCicilanDto.bulan) {
        updateCicilanDto.bulan = Number(updateCicilanDto.bulan) as 3 | 6 | 12;
      }

      const cicilan = await this.cicilanService.update(id, updateCicilanDto);
      req.flash('success', 'Cicilan updated successfully');
      res.redirect(`/kelass/detail/kelas/admin/${cicilan.kelas.id}`);
    } catch (error) {
      const cicilan = await this.cicilanService.findOne(id);
      req.flash('error', error.message || 'Failed to update cicilan');
      res.redirect(`/kelass/detail/kelas/admin/${cicilan.kelas.id}`);
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
      const cicilan = await this.cicilanService.findOne(id);
      const kelasId = cicilan.kelas.id;
      await this.cicilanService.remove(id);
      req.flash('success', 'Cicilan deleted successfully');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      const cicilan = await this.cicilanService.findOne(id);
      const kelasId = cicilan.kelas.id;
      req.flash('error', error.message || 'Failed to delete cicilan');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }
}
