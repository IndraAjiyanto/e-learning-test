import { User } from 'src/users/entities/user.entity';
import 'express-session';

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      username: string;
      profile: string;
      email: string;
      role: 'admin' | 'super_admin' | 'user';
    }

    interface Request {
      user?: UserPayload;
      flash(type: string, message?: string): string[];
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    flash?: { [key: string]: string[] };
  }
}
