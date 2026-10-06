import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  filter?: Record<string, unknown>;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const Paginate = createParamDecorator(
  (
    data: { defaultLimit?: number } = {},
    ctx: ExecutionContext,
  ): PaginationParams => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query as Record<string, unknown>;

    const pageRaw =
      typeof query.page === 'string' ? parseInt(query.page, 10) : 1;
    const limitRaw =
      typeof query.limit === 'string'
        ? parseInt(query.limit, 10)
        : data.defaultLimit || 10;

    const page = pageRaw > 0 ? pageRaw : 1;
    const limit = limitRaw > 0 ? limitRaw : 10;

    const otherParams = { ...query };
    delete otherParams.page;
    delete otherParams.limit;

    return {
      page,
      limit,
      skip: (page - 1) * limit,
      filter: otherParams,
    };
  },
);
