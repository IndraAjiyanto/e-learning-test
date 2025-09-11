import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigImage } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('super_admin')
  @Post()
  @UseInterceptors(FileInterceptor('profile', multerConfigImage)) 
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response, @UploadedFile() profile: Express.Multer.File, @Req() req:any) {
    try {
      createUserDto.profile = profile.filename;
      await this.usersService.create(createUserDto);
      req.flash('success', 'User created successfully');
      res.redirect('/users')
    } catch (error) {
      req.flash('error', 'Failed to create user');
      res.redirect('/users')
    }
  }

  @Get('profile')
  async profile(@Res() res: Response, @Req() req:any){
    const user = await this.usersService.findOne(req.user.id) 
    return res.render('profile/index', {user: user});
  }

  @Get('profile/password')
  editPassword(@Res() res: Response, @Req() req:any){
    return res.render('profile/editPassword', {user: req.user});
  }

  @Get('profile/info_akun')
  editInfoAkun(@Res() res: Response, @Req() req:any){
    return res.render('profile/editInfo', {user: req.user});
  }

  // get All users
@Roles('super_admin')
@Get()
async findAll(@Res() res: Response, @Req() req: any) {
  const users = await this.usersService.findAll();
  res.render('super_admin/user/index', { user: req.user, users});
}

// get one user to edit
  @Roles('super_admin')
  @Get('formEdit/:userId')
  async formEdit(@Param('userId') userId: number, @Res() res: Response, @Req() req: any) {
    const users = await this.usersService.findOne(userId);
    res.render('super_admin/user/edit', {user: req.user, users});
  }

  // form create user
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

  // update user
  @Roles('super_admin')
  @Patch('super_admin/:userId')
  @UseInterceptors(FileInterceptor('profile', multerConfigImage)) 
  async updateAdmin(@UploadedFile() profile: Express.Multer.File, @Param('userId') userId: number, @Res() res: Response, @Body() updateUserDto: UpdateUserDto, @Req()  req:Request) {
    try {
      const user = await this.usersService.findOne(userId)
      if (profile) {
      await this.usersService.getPublicIdFromUrl(user.profile);
      updateUserDto.profile = profile.filename; 
    } 
      await this.usersService.update(userId, updateUserDto);
      req.flash('success', 'User successfully updated');
      res.redirect('/users')
    } catch (error) {
      req.flash('error', 'User failed to update');
      res.redirect('/users')
    }
  }

  @Patch('password/:id')
  async updatePassword(@Param('id') id: number, @Res() res: Response, @Body() updatePaaswordDto: UpdatePasswordDto){
    await this.usersService.updatePassword(id, updatePaaswordDto);
    res.redirect('/users/profile')
  }

  @Patch('update/profile/:userId')
  @UseInterceptors(FileInterceptor('profile', multerConfigImage)) 
  async updateProfile(@Param('userId') userId: number, @Res() res:Response, @Body() updateProfileDto: UpdateProfileDto, @UploadedFile() profile: Express.Multer.File, @Req() req:Request ){
    const user = await this.usersService.findOne(userId)
    if (profile) {
      await this.usersService.getPublicIdFromUrl(user.profile);
      updateProfileDto.profile = profile.filename; 
    } 
    await this.usersService.updateProfile(userId, updateProfileDto)
    res.redirect('/users/profile')
  }

@Roles('super_admin')
@Delete(':id')
async remove(
  @Param('id') id: number,
  @Res() res: Response,
  @Req() req: any,
) {
  try {

    const user = await this.usersService.findOne(id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/users');
    }
    await this.usersService.getPublicIdFromUrl(user.profile);


    await this.usersService.remove(id); 

    req.flash('success', 'User successfully deleted');
    return res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to delete user');
    return res.redirect('/users');
  }
}

}
