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
  UseFilters,
} from '@nestjs/common';
import { ValueService } from './value.service';
import { CreateValueDto } from './dto/create-value.dto';
import { UpdateValueDto } from './dto/update-value.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { flashToast } from 'src/common/utils/toast.util';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';

@UseGuards(AuthenticatedGuard)
@UseFilters(FileUploadExceptionFilter)
@Controller('value')
export class ValueController {
  constructor(private readonly valueService: ValueService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createValueDto: CreateValueDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createValueDto.valueOrder = await this.valueService.noValue();
      await this.valueService.create(createValueDto);
      flashToast(
        req,
        'Value Created',
        'The value has been added successfully.',
      );
      res.redirect('/value');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create value');
      res.redirect('/value');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const values = await this.valueService.findAll();
    res.render('super_admin/value/index', { user: req.user, values });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/value/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const value = await this.valueService.findOne(id);
    res.render('super_admin/value/edit', { user: req.user, value });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateValueDto: UpdateValueDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.valueService.update(id, updateValueDto);
      flashToast(
        req,
        'Value Updated',
        'The changes to this value have been saved.',
      );
      res.redirect('/value');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update value');
      res.redirect('/value');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const value = await this.valueService.findOne(id);
      if (!value) {
        req.flash('error', 'Value not found');
        res.redirect('/value');
      }
      await this.valueService.remove(id);
      flashToast(
        req,
        'Value Deleted',
        'The value has been removed successfully.',
      );
      res.redirect('/value');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete value');
      res.redirect('/value');
    }
  }
}
