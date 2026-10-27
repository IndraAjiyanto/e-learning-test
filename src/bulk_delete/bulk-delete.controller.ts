import { Body, Controller, Delete, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { BulkDeleteService } from './bulk-delete.service';

@Roles('super_admin')
@Controller('api/bulk-delete')
export class BulkDeleteController {
  constructor(private readonly bulkDeleteService: BulkDeleteService) {}

  @Post('selected')
  async deleteSelected(
    @Body('entity') entity: string,
    @Body('ids') ids: string[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.bulkDeleteService.deleteSelected(
        entity,
        ids,
        req.user,
      );
      return res.json(result);
    } catch (error: unknown) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to delete selected data',
      });
    }
  }

  @Delete('selected')
  async deleteSelectedDelete(
    @Body('entity') entity: string,
    @Body('ids') ids: string[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.deleteSelected(entity, ids, req, res);
  }

  @Post('all')
  async deleteAll(
    @Body('entity') entity: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.bulkDeleteService.deleteAll(entity, req.user);
      return res.json(result);
    } catch (error: unknown) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to delete all data',
      });
    }
  }

  @Delete('all')
  async deleteAllDelete(
    @Body('entity') entity: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.deleteAll(entity, req, res);
  }
}
