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
import { BackgroundService } from './background.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response, Request } from 'express';

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
      createBackgroundDto.background_ke =
        await this.backgroundService.noBackground();
      await this.backgroundService.create(createBackgroundDto);
      req.flash('success', 'background successfully created');
      res.redirect('/background');
    } catch (error: any) {
      req.flash('error', 'background failed to create');
      res.redirect('/background');
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
      req.flash('success', 'background successfully updated');
      res.redirect('/background');
    } catch (error: any) {
      req.flash('error', 'background failed to update');
      res.redirect('/background');
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
      req.flash('success', 'background successfully deleted');
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
