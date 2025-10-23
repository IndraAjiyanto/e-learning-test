import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationParams {
  page: number;
  limit: number;
  [key: string]: any;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Decorator untuk extract pagination parameters dari query string
 * Default: page = 1, limit = 10
 *
 * Usage:
 * @Get()
 * async findAll(@Paginate() pagination: PaginationParams) {
 *   return this.service.findAll(pagination);
 * }
 */
export const Paginate = createParamDecorator(
  (
    data: { defaultLimit?: number } = {},
    ctx: ExecutionContext,
  ): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || data.defaultLimit || 10;

    // Extract semua query params lainnya (untuk filtering)
    const otherParams = { ...query };
    delete otherParams.page;
    delete otherParams.limit;

    return {
      page: page > 0 ? page : 1,
      limit: limit > 0 ? limit : 10,
      ...otherParams,
    };
  },
);
