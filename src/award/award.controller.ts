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

@UseGuards(AuthenticatedGuard)
@Controller('award')
export class AwardController {
  constructor(private readonly awardService: AwardService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createAwardDto: CreateAwardDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createAwardDto.awardOrder = await this.awardService.noAward();
      await this.awardService.create(createAwardDto);
      req.flash('success', 'award successfully created');
      res.redirect('/award');
    } catch (error: any) {
      req.flash('error', 'award failed to create');
      res.redirect('/award');
    }
  }

  @Roles('super_admin')
  @Get()
  async index(@Res() res: Response, @Req() req: Request) {
    const award = await this.awardService.findAll();
    res.render('super_admin/award/index', { user: req.user, award });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const award = await this.awardService.findOne(id);
    res.render('super_admin/award/edit', { user: req.user, award });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateAwardDto: UpdateAwardDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.awardService.update(id, updateAwardDto);
      req.flash('success', 'award successfully updated');
      res.redirect('/award');
    } catch (error: any) {
      req.flash('error', 'award failed to update');
      res.redirect('/award');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.awardService.remove(id);
      req.flash('success', 'award successfully deleted');
      res.redirect('/award');
    } catch (error: any) {
      req.flash('error', 'award failed to delete');
      res.redirect('/award');
    }
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/award/create', { user: req.user });
  }
}
