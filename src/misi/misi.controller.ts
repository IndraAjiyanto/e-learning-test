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

@Controller('misi')
export class MisiController {
  constructor(private readonly misiService: MisiService) {}

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Post()
  async create(@Body() createMisiDto: CreateMisiDto, @Res() res: Response) {
    await this.misiService.create(createMisiDto);
    res.redirect('/misi');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get()
  async index(@Res() res: Response, @Req() req: Request) {
    const misis = await this.misiService.findAll();
    res.render('super_admin/misi/index', { user: req.user, misis });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get(':id/edit')
  async edit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const misi = await this.misiService.findOne(+id);
    res.render('super_admin/misi/edit', { user: req.user, misi });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMisiDto: UpdateMisiDto,
    @Res() res: Response,
  ) {
    await this.misiService.update(+id, updateMisiDto);
    res.redirect('/misi');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.misiService.remove(+id);
    res.redirect('/misi');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get('formCreate')
  formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/misi/create', { user: req.user });
  }
}
