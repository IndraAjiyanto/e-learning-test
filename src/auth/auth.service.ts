import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { KelassService } from 'src/kelass/kelass.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, private kelasService: KelassService) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async createAcount(createUserDto: CreateUserDto){
      const isMatch = await bcrypt.compare(createUserDto.password, createUserDto.confirm_password);
      if (!isMatch) {
      createUserDto.profile = 'logo_wiratek.png'
            return await this.userService.create(createUserDto)
      }else{
           throw new BadRequestException('Password no match');
      }

  }

  async findAllKelas(){
    return await this.kelasService.findAllLaunch()
  }

  async findKelas(id: number){
    return await this.kelasService.findOne(id)
  }
}
