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
  @Get('formCreate/:categoryId')
  async formCreate(
    @Param('categoryId') categoryId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.render('super_admin/flow_category/create', {
      user: req.user,
      categoryId,
    });
  }

  @Roles('super_admin')
  @Post(':categoryId')
  async createFromForm(
    @Body() createFlowCategoryDto: CreateFlowCategoryDto,
    @Param('categoryId') categoryId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createFlowCategoryDto.categoryId = categoryId;
      await this.flowCategoryService.create(createFlowCategoryDto);
      req.flash('success', 'flow category successfully created');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', 'Failed to create flow category');
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
    const flowCategory = await this.flowCategoryService.findOne(id);
    res.render('super_admin/flow_category/edit', {
      flowCategory,
      user: req.user,
    });
  }

  @Roles('super_admin')
  @Patch('formEdit/:id/:categoryId')
  async updateFromForm(
    @Param('id') id: number,
    @Param('categoryId') categoryId: number,
    @Body() updateFlowCategoryDto: UpdateFlowCategoryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.flowCategoryService.update(id, updateFlowCategoryDto);
      req.flash('success', 'Flow category successfully updated');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', 'Failed to update flow category');
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
      await this.flowCategoryService.remove(id);
      req.flash('success', 'Flow category successfully deleted');
      res.redirect('/category/' + categoryId);
    } catch (error: any) {
      req.flash('error', 'Failed to delete flow category');
      res.redirect('/category/' + categoryId);
    }
  }
}
