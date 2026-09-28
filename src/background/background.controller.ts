import {
  BadRequestException,
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
import { BackgroundService } from './background.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response, Request } from 'express';
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Controller('background')
export class BackgroundController {
  constructor(private readonly backgroundService: BackgroundService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createBackgroundDto: CreateBackgroundDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createBackgroundDto.backgroundOrder =
        await this.backgroundService.noBackground();
      await this.backgroundService.create(createBackgroundDto);
      flashToast(
        req,
        'Background Created',
        'The educational background has been added successfully.',
      );
      res.redirect('/background');
    } catch (error: unknown) {
      req.flash(
        'error',
        error instanceof BadRequestException
          ? error.message
          : 'background failed to create',
      );
      res.redirect('/background/formCreate');
    }
  }

  @Roles('super_admin')
  @Get()
  async index(@Res() res: Response, @Req() req: Request) {
    const background = await this.backgroundService.findAll();
    res.render('super_admin/background/index', { user: req.user, background });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const background = await this.backgroundService.findOne(id);
    res.render('super_admin/background/edit', { user: req.user, background });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBackgroundDto: UpdateBackgroundDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.backgroundService.update(id, updateBackgroundDto);
      flashToast(
        req,
        'Changes Saved',
        'The educational background has been updated successfully.',
      );
      res.redirect('/background');
    } catch (error: unknown) {
      req.flash(
        'error',
        error instanceof BadRequestException
          ? error.message
          : 'background failed to update',
      );
      res.redirect(`/background/formEdit/${id}`);
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
      await this.backgroundService.remove(id);
      flashToast(
        req,
        'Background Deleted',
        'The educational background has been removed successfully.',
      );
      res.redirect('/background');
    } catch (error: any) {
      req.flash('error', 'background failed to delete');
      res.redirect('/background');
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/background/create', { user: req.user });
  }
}
