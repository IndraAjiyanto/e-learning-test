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
    // Ids are uuids. Coercing with Number() here would turn every id into NaN
    // and silently sign everyone out.
    if (typeof userId !== 'string' || userId.length === 0) {
      return done(null, null);
    }
    const user = await this.usersService.findOne(userId);
    if (!user) return done(null, null);
    done(null, user);
  }
}
