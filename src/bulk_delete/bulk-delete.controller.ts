import { Body, Controller, Delete, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { BulkDeleteService } from './bulk-delete.service';
import { flashToast, flashToastError } from '../common/utils/toast.util';

@Roles('admin', 'super_admin')
@Controller(['bulk-delete', 'api/bulk-delete'])
export class BulkDeleteController {
  constructor(private readonly bulkDeleteService: BulkDeleteService) {}

  private extractIds(rawIds: any): string[] {
    if (Array.isArray(rawIds)) {
      return rawIds.map(String).filter(Boolean);
    }
    if (typeof rawIds === 'string' && rawIds.trim()) {
      try {
        const parsed = JSON.parse(rawIds);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {}
      return rawIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }

  @Post('selected')
  async deleteSelected(
    @Body('entity') entity: string,
    @Body('ids') rawIds: any,
    @Body('redirectUrl') redirectUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const wantsJson =
      req.xhr ||
      (req.headers.accept &&
        req.headers.accept.includes('application/json') &&
        !req.headers.accept.includes('text/html'));

    const ids = this.extractIds(rawIds);

    try {
      const result = await this.bulkDeleteService.deleteSelected(
        entity,
        ids,
        req.user,
      );

      if (wantsJson) {
        return res.json(result);
      }

      flashToast(
        req,
        'Deleted Successfully',
        result.message || 'Selected data has been deleted successfully.',
      );
      const target = redirectUrl || req.header('Referer') || '/';
      return res.redirect(target);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete selected data';

      if (wantsJson) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      flashToastError(req, 'Failed to Delete', message);
      const target = redirectUrl || req.header('Referer') || '/';
      return res.redirect(target);
    }
  }

  @Delete('selected')
  async deleteSelectedDelete(
    @Body('entity') entity: string,
    @Body('ids') rawIds: any,
    @Body('redirectUrl') redirectUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.deleteSelected(entity, rawIds, redirectUrl, req, res);
  }

  @Post('all')
  async deleteAll(
    @Body('entity') entity: string,
    @Body('redirectUrl') redirectUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const wantsJson =
      req.xhr ||
      (req.headers.accept &&
        req.headers.accept.includes('application/json') &&
        !req.headers.accept.includes('text/html'));

    try {
      const result = await this.bulkDeleteService.deleteAll(entity, req.user);

      if (wantsJson) {
        return res.json(result);
      }

      flashToast(
        req,
        'Deleted Successfully',
        result.message || 'All data has been deleted successfully.',
      );
      const target = redirectUrl || req.header('Referer') || '/';
      return res.redirect(target);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete all data';

      if (wantsJson) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      flashToastError(req, 'Failed to Delete', message);
      const target = redirectUrl || req.header('Referer') || '/';
      return res.redirect(target);
    }
  }

  @Delete('all')
  async deleteAllDelete(
    @Body('entity') entity: string,
    @Body('redirectUrl') redirectUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.deleteAll(entity, redirectUrl, req, res);
  }
}
