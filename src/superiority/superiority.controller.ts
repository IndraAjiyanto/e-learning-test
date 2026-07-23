import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  @Get('formCreate/:categoryId')
  async formCreate(
    @Param('categoryId') categoryId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('super_admin/superiority/create', {
      user: req.user,
      categoryId,
    });
  }

  @Roles('super_admin')
  @Post(':categoryId')
  async createFromForm(
    @Body() createSuperiorityDto: CreateSuperiorityDto,
    @Param('categoryId') categoryId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createSuperiorityDto.categoryId = categoryId;
      await this.superiorityService.create(createSuperiorityDto);
      req.flash('success', 'superiority successfully created');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', 'Failed to create superiority');
      res.redirect('/category/' + categoryId);
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
  @Patch('formEdit/:id/:categoryId')
  async updateFromForm(
    @Param('id') id: number,
    @Param('categoryId') categoryId: number,
    @Body() updateSuperiorityDto: UpdateSuperiorityDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.superiorityService.update(id, updateSuperiorityDto);
      req.flash('success', 'Superiority successfully updated');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', 'Failed to update superiority');
      res.redirect('/category/' + categoryId);
    }
  }

  @Roles('super_admin')
  @Delete(':id/:categoryId')
  async deleteFromForm(
    @Param('id') id: number,
    @Param('categoryId') categoryId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.superiorityService.remove(id);
      req.flash('success', 'Superiority successfully deleted');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', 'Failed to delete superiority');
      res.redirect('/category/' + categoryId);
    }
  }
}
