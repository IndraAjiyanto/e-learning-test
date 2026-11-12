import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FooterService } from './footer.service';

@Injectable()
export class FooterMiddleware implements NestMiddleware {
  constructor(private readonly footerService: FooterService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const path = req.path || '';

    // Abaikan request untuk aset statis dan API yang tidak merender view HTML
    if (
      path.startsWith('/public') ||
      path.startsWith('/asset') ||
      path.startsWith('/uploads') ||
      path.startsWith('/api') ||
      path === '/favicon.ico' ||
      /\.(css|js|png|jpe?g|gif|svg|ico|woff2?|ttf|map)$/i.test(path)
    ) {
      return next();
    }

    const user = req.user as { role?: string } | undefined;
    const role = user?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      try {
        const [footerData, footerCategories] = await Promise.all([
          this.footerService.getFooterData(),
          this.footerService.getCategories(),
        ]);
        res.locals.footerData = footerData;
        res.locals.footerCategories = footerCategories;
        res.locals.social = footerData ? [footerData] : [];
      } catch (error) {
        console.error('Footer middleware error:', error);
      }
    }
    next();
  }
}
