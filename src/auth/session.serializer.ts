import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersService } from 'src/users/users.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    if (!id || !UUID_REGEX.test(id)) {
      return done(null, null);
    }
    try {
      const user = await this.usersService.findOne(id);
      done(null, user ?? null);
    } catch {
      done(null, null);
    }
  }
}
