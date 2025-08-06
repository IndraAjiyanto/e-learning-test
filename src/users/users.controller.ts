import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('super_admin')
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    await this.usersService.create(createUserDto);
    res.redirect('/users')
  }

  @Get('profile')
  profile(@Res() res: Response ){
    return res.render('profile/index');
  }

  @Get('profile/mycourse')
  Mycourse(@Res() res: Response ){
    return res.render('profile/course');
  }

  @Roles('admin')
  @Post(':userId/kelas/:kelasId')
  addUserToKelas(@Param('userId') userId: number, @Param('kelasId') kelasId: number) {
  return this.usersService.addUserToKelas(userId, kelasId);
}

@Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: any) {
    const users = await this.usersService.findAll();
    res.render('user/index', {user: req.user, users})
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(@Param('id') id: number, @Res() res: Response, @Req() req: any) {
    const users = await this.usersService.findOne(id);
    res.render('user/edit', {user: req.user, users});
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: any) {
    res.render('user/create', {user: req.user});
  }

  @Roles('super_admin', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Roles('super_admin', 'admin')
  @Patch(':id')
  async update(@Param('id') id: number, @Res() res: Response, @Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    await this.usersService.update(id, updateUserDto);
    res.redirect('/users')
  }

  @Roles('super_admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
