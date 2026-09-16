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
import { flashToast } from 'src/common/utils/toast.util';

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
      flashToast(
        req,
        'Award Created',
        'The award has been added successfully.',
      );
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
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const award = await this.awardService.findOne(id);
    res.render('super_admin/award/edit', { user: req.user, award });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAwardDto: UpdateAwardDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.awardService.update(id, updateAwardDto);
      flashToast(
        req,
        'Award Updated',
        'The changes to this award have been saved.',
      );
      res.redirect('/award');
    } catch (error: any) {
      req.flash('error', 'award failed to update');
      res.redirect('/award');
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
      await this.awardService.remove(id);
      flashToast(
        req,
        'Award Deleted',
        'The award has been removed successfully.',
      );
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
