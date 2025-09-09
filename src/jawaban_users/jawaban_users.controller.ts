import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { JawabanUsersService } from './jawaban_users.service';
import { CreateJawabanUserDto } from './dto/create-jawaban_user.dto';
import { UpdateJawabanUserDto } from './dto/update-jawaban_user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@UseGuards(AuthenticatedGuard)
@Controller('jawaban-users')
export class JawabanUsersController {
  constructor(private readonly jawabanUsersService: JawabanUsersService) {}

@Roles('user')
@Post()
async create(@Body() createJawabanUserDto: CreateJawabanUserDto, @Req() req:any, @Res() res:Response) {
  createJawabanUserDto.jawabanUser =  createJawabanUserDto.jawabanUser.map(j=>({
    ...j,
    userId: req.user.id
  }))
  await this.jawabanUsersService.create(createJawabanUserDto);
  res.redirect('dashboard')
}

  @Get()
  findAll() {
    return this.jawabanUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jawabanUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJawabanUserDto: UpdateJawabanUserDto) {
    return this.jawabanUsersService.update(+id, updateJawabanUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jawabanUsersService.remove(+id);
  }
}
