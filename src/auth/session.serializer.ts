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

  async deserializeUser(userId: any, done: CallableFunction) {
    const id = String(userId);
    if (!id) {
      return done(null, null);
    }
    const user = await this.usersService.findOne(id);
    if (!user) return done(null, null);
    done(null, user);
  }
}
