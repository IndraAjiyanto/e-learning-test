import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserActivityService } from 'src/user_activity/user-activity.service';

@Controller('information')
export class InformationController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Roles('super_admin')
  @Get()
  async index(@Req() req: Request, @Res() res: Response) {
    await this.userActivityService.purgeExpired(60).catch(() => undefined);
    const [summary, weekly, activeUsers] = await Promise.all([
      this.userActivityService.getSummaryToday(),
      this.userActivityService.getWeeklyChart(),
      this.userActivityService.getActiveParticipants(5),
    ]);

    res.render('super_admin/information/index', {
      user: req.user,
      summary,
      weekly,
      activeUsers,
    });
  }
}