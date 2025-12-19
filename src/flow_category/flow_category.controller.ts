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
import { FlowCategoryService } from './flow_category.service';
import { CreateFlowCategoryDto } from './dto/create-flow_category.dto';
import { UpdateFlowCategoryDto } from './dto/update-flow_category.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('flow_category')
export class FlowCategoryController {
  constructor(private readonly flowCategoryService: FlowCategoryService) {}

  @Roles('super_admin')
  @Get('formCreate/:kategoriId')
  async formCreate(
    @Param('kategoriId') kategoriId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('super_admin/flow_category/create', {
      user: req.user,
      kategoriId,
    });
  }

  @Roles('super_admin')
  @Post(':kategoriId')
  async createFromForm(
    @Body() createFlowCategoryDto: CreateFlowCategoryDto,
    @Param('kategoriId') kategoriId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createFlowCategoryDto.kategoriId = kategoriId;
      await this.flowCategoryService.create(createFlowCategoryDto);
      req.flash('success', 'flow category successfully created');
      res.redirect('/kategoris/' + kategoriId);
    } catch (error) {
      req.flash('error', 'Failed to create flow category');
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
    const flowCategory = await this.flowCategoryService.findOne(id);
    res.render('super_admin/flow_category/edit', {
      flowCategory,
      user: req.user,
    });
  }

  @Roles('super_admin')
  @Patch('formEdit/:id/:kategoriId')
  async updateFromForm(
    @Param('id') id: number,
    @Param('kategoriId') kategoriId: number,
    @Body() updateFlowCategoryDto: UpdateFlowCategoryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.flowCategoryService.update(id, updateFlowCategoryDto);
      req.flash('success', 'Flow category successfully updated');
      res.redirect('/kategoris/' + kategoriId);
    } catch (error) {
      req.flash('error', 'Failed to update flow category');
      res.redirect('/kategoris/' + kategoriId);
    }
  }

  @Roles('super_admin')
  @Delete(':id/:kategoriId')
  async deleteFromForm(
    @Param('id') id: number,
    @Param('kategoriId') kategoriId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.flowCategoryService.remove(id);
      req.flash('success', 'Flow category successfully deleted');
      res.redirect('/kategoris/' + kategoriId);
    } catch (error) {
      req.flash('error', 'Failed to delete flow category');
      res.redirect('/kategoris/' + kategoriId);
    }
  }
}
