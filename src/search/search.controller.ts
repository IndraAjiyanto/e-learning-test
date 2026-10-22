import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { Request, Response } from 'express';

@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async globalSearch(
    @Query() queryDto: SearchQueryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const query = queryDto?.q || '';
      const userId = (req.user as { id?: string } | undefined)?.id;
      const data = await this.searchService.search(query, userId);
      const total =
        (data.courses?.length || 0) +
        (data.programs?.length || 0) +
        (data.learnings?.length || 0) +
        (data.portfolios?.length || 0) +
        (data.payments?.length || 0) +
        (data.menus?.length || 0);

      return res.json({
        status: 'success',
        query,
        total,
        data,
      });
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to perform search',
        data: {
          courses: [],
          programs: [],
          learnings: [],
          portfolios: [],
          payments: [],
          menus: [],
        },
      });
    }
  }
}
