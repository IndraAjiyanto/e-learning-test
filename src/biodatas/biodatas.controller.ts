import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { BiodatasService } from './biodatas.service';
import { CreateBiodataDto } from './dto/create-biodata.dto';
import { UpdateBiodataDto } from './dto/update-biodata.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('biodata')
export class BiodatasController {
  constructor(private readonly biodatasService: BiodatasService) {}

  @Roles('user')
  @Post()
  async create(
    @Body() createBiodataDto: CreateBiodataDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (req.user) {
        createBiodataDto.userId = req.user.id;
      }
      await this.biodatasService.create(createBiodataDto);
      req.flash('success', 'biodata successfully create');
      res.redirect('/users/profile');
    } catch (error: any) {
      req.flash('error', error.message || 'biodata failed to create');
      res.redirect('/users/profile');
    }
  }

  @Roles('user')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('user/biodata/create', { user: req.user });
  }

  @Roles('user')
  @Get('formEdit/:biodataId')
  async formEdit(
    @Param('biodataId') biodataId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const biodata = await this.biodatasService.findOne(biodataId);
    res.render('user/biodata/edit', { user: req.user, biodata });
  }

  @Roles('user')
  @Patch(':biodataId')
  async update(
    @Param('biodataId') biodataId: number,
    @Body() updateBiodataDto: UpdateBiodataDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.biodatasService.update(biodataId, updateBiodataDto);
      req.flash('success', 'biodata successfully update');
      res.redirect('/users/profile');
    } catch (error: any) {
      req.flash('error', error.message || 'biodata failed to update');
      res.redirect('/users/profile');
    }
  }
}
