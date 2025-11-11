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

@Controller('background')
export class BackgroundController {
  constructor(private readonly backgroundService: BackgroundService) {}

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Post()
  async create(
    @Body() createBackgroundDto: CreateBackgroundDto,
    @Res() res: Response,
  ) {
    await this.backgroundService.create(createBackgroundDto);
    res.redirect('/background');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get()
  async index(@Res() res: Response, @Req() req: Request) {
    const backgrounds = await this.backgroundService.findAll();
    res.render('super_admin/background/index', { user: req.user, backgrounds });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get(':id/edit')
  async edit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const background = await this.backgroundService.findOne(+id);
    res.render('super_admin/background/edit', { user: req.user, background });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBackgroundDto: UpdateBackgroundDto,
    @Res() res: Response,
  ) {
    await this.backgroundService.update(+id, updateBackgroundDto);
    res.redirect('/background');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.backgroundService.remove(+id);
    res.redirect('/background');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get('formCreate')
  formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/background/create', { user: req.user });
  }
}
