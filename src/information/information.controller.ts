import { Controller, Get, Req, Res, Sse } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserActivityService } from 'src/user_activity/user-activity.service';

@Controller('information')
export class InformationController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Roles('super_admin')
  @Get()
  async index(@Req() req: Request, @Res() res: Response) {
    await this.userActivityService.purgeExpired(60).catch(() => undefined);
    const WEEKLY_THRESHOLD_MINUTES = 5;

    const [summary, weekly, activeUsersList, learningList] = await Promise.all([
      this.userActivityService.getSummaryToday(),
      this.userActivityService.getWeeklyChart(),
      this.userActivityService.getActiveParticipants(WEEKLY_THRESHOLD_MINUTES),
      this.userActivityService.getCurrentlyLearning(WEEKLY_THRESHOLD_MINUTES),
    ]);

    res.render('super_admin/information/index', {
      user: req.user,
      title: 'Dashboard Overview',
      subtitle: 'Pantau aktivitas dan ringkasan metrik pengguna',
      summary,
      totalUsers: summary.activeToday,
      activeUsers: summary.onlineNow,
      chartData: weekly.map((w) => ({
        day: w.label,
        loginHeight: w.loginH,
        activeHeight: w.activeH,
        max: w.max,
      })),
      activeUsersList,
      learningList,
      learningListJson: JSON.stringify(learningList),
    });
  }

  @Roles('super_admin')
  @Sse('api/learning/stream')
  learningStream(): Observable<any> {
    return this.userActivityService.learningStream();
  }
}