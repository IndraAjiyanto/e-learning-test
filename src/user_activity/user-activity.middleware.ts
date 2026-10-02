import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserActivityService } from './user-activity.service';

@Injectable()
export class UserActivityMiddleware implements NestMiddleware {
  constructor(private readonly userActivityService: UserActivityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path || '';

    // Abaikan request untuk aset statis, gambar, css, js, font, icon
    if (
      path.startsWith('/public') ||
      path.startsWith('/asset') ||
      path.startsWith('/uploads') ||
      path === '/favicon.ico' ||
      /\.(css|js|png|jpe?g|gif|svg|ico|woff2?|ttf|map)$/i.test(path)
    ) {
      return next();
    }

    const user = (req as any).user;
    if (user?.id) {
      this.userActivityService.handleRequest(user, req).catch(() => undefined);
    }
    next();
  }
}
