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
import { AwardService } from './award.service';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response, Request } from 'express';

@Controller('award')
export class AwardController {
  constructor(private readonly awardService: AwardService) {}

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Post()
  async create(@Body() createAwardDto: CreateAwardDto, @Res() res: Response) {
    await this.awardService.create(createAwardDto);
    res.redirect('/award');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get()
  async index(@Res() res: Response, @Req() req: Request) {
    const awards = await this.awardService.findAll();
    res.render('super_admin/award/index', { user: req.user, awards });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get(':id/edit')
  async edit(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const award = await this.awardService.findOne(+id);
    res.render('super_admin/award/edit', { user: req.user, award });
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAwardDto: UpdateAwardDto,
    @Res() res: Response,
  ) {
    await this.awardService.update(+id, updateAwardDto);
    res.redirect('/award');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.awardService.remove(+id);
    res.redirect('/award');
  }

  @UseGuards(AuthenticatedGuard)
  @Roles('super_admin')
  @Get('formCreate')
  formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/award/create', { user: req.user });
  }
}
