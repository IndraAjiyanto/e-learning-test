import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FooterService } from './footer.service';

@Injectable()
export class FooterMiddleware implements NestMiddleware {
  constructor(private readonly footerService: FooterService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as any;
    const role = user?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      const [footerData, footerCategories] = await Promise.all([
        this.footerService.getFooterData(),
        this.footerService.getCategories(),
      ]);
      res.locals.footerData = footerData;
      res.locals.footerCategories = footerCategories;
    }
    next();
  }
}
