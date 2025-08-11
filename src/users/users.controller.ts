import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Response } from 'express';
import { UpdatePasswordDto } from './dto/update-password.dto';

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
  profile(@Res() res: Response, @Req() req:any){
    return res.render('profile/index', {user: req.user});
  }

  @Get('profile/password')
  editPassword(@Res() res: Response, @Req() req:any){
    return res.render('profile/editPassword', {user: req.user});
  }

  @Get('profile/info_akun')
  editInfoAkun(@Res() res: Response, @Req() req:any){
    return res.render('profile/editInfo', {user: req.user});
  }

@Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: any) {
    const users = await this.usersService.findAll();
    res.render('super_admin/user/index', {user: req.user, users})
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async formEdit(@Param('id') id: number, @Res() res: Response, @Req() req: any) {
    const users = await this.usersService.findOne(id);
    res.render('super_admin/user/edit', {user: req.user, users});
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: any) {
    res.render('super_admin/user/create', {user: req.user});
  }

  @Roles('super_admin', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Res() res: Response, @Body() updateUserDto: UpdateUserDto) {
    await this.usersService.update(id, updateUserDto);
    res.redirect('/users/profile')
  }

  @Patch('password/:id')
  async updatePassword(@Param('id') id: number, @Res() res: Response, @Body() updatePaaswordDto: UpdatePasswordDto){
    await this.usersService.updatePassword(id, updatePaaswordDto);
    res.redirect('/users/profile')
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.usersService.remove(id);
    res.redirect('/users')
  }

}
