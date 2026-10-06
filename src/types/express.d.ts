import 'express-session';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      username: string;
      profile: string;
      email: string;
      role: 'admin' | 'super_admin' | 'user';
      isVerified?: boolean;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserPayload {}

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
