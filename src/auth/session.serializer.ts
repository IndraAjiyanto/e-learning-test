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

  serializeUser(user: User, done: (err: Error | null, id?: unknown) => void) {
    done(null, user.id);
  }

  async deserializeUser(
    userId: unknown,
    done: (err: Error | null, user?: User | null) => void,
  ) {
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
