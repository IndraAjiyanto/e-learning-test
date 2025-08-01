import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: CallableFunction) {
    done(null, user.id);
  }

  async deserializeUser(userId: number, done: CallableFunction) {
    const user = await this.usersService.findOne(userId); 
    if (!user) return done(null, null);
    done(null, user); 
  }
}
