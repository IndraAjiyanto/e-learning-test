import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserActivityService } from './user-activity.service';

@Injectable()
export class UserActivityMiddleware implements NestMiddleware {
  constructor(private readonly userActivityService: UserActivityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (user?.id) {
      this.userActivityService.touch(user.id).catch(() => undefined);
    }
    next();
  }
}