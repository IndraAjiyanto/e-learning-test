import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { BiodatasService } from './biodatas.service';
import { CreateBiodataDto } from './dto/create-biodata.dto';
import { UpdateBiodataDto } from './dto/update-biodata.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response } from 'express';
import { User } from 'src/entities/user.entity';

@UseGuards(AuthenticatedGuard)
@Controller('biodatas')
export class BiodatasController {
  constructor(private readonly biodatasService: BiodatasService) {}

  @Roles('user')
  @Post()
  async create(@Body() createBiodataDto: CreateBiodataDto, @Req() req:any, @Res() res: Response) {
  createBiodataDto.userId = req.user.id;
  await this.biodatasService.create(createBiodataDto);
  res.redirect('/users/profile');
  }

  @Get()
  findAll() {
    return this.biodatasService.findAll();
  }

  @Roles('user')
  @Get('create')
  async formCreate(@Res() res:Response, @Req() req:any){
    res.render('user/biodata/create', {user: req.user})
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.biodatasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBiodataDto: UpdateBiodataDto) {
    return this.biodatasService.update(+id, updateBiodataDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.biodatasService.remove(+id);
  }
}
