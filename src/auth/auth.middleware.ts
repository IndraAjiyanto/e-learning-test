// auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request & { isAuthenticated: () => boolean }, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.redirect('/session-expired');
        }
        next();
    }
}