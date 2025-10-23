import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationResult } from '../decorators/pagination.decorator';

/**
 * Helper function untuk pagination yang lebih simple
 * Bisa digunakan dengan QueryBuilder atau Repository
 */
export async function paginateQuery<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  page: number = 1,
  limit: number = 10,
): Promise<PaginationResult<T>> {
  const skip = (page - 1) * limit;

  const [items, total] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Helper function untuk pagination dengan Repository biasa
 */
export async function paginateRepository<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: {
    page?: number;
    limit?: number;
    where?: any;
    order?: any;
    relations?: string[];
  } = {},
): Promise<PaginationResult<T>> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await repository.findAndCount({
    where: options.where,
    order: options.order,
    relations: options.relations,
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}
