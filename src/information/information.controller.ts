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

    const [summary, weekly, activeUsersList] = await Promise.all([
      this.userActivityService.getSummaryToday(),
      this.userActivityService.getWeeklyChart(),
      this.userActivityService.getActiveParticipants(WEEKLY_THRESHOLD_MINUTES),
    ]);

    res.render('super_admin/information/index', {
      user: req.user,
      title: 'Dashboard Overview',
      subtitle: 'Pantau aktivitas dan ringkasan metrik pengguna',
      summary,
      activeToday: summary.activeToday,
      activeUsers: summary.onlineNow,
      learningNow: summary.learningNow,
      mentorActive: summary.mentorActive,
      programActive: summary.programActive,
      chartData: weekly.map((w) => ({
        day: w.label,
        loginHeight: w.loginH,
        learningHeight: w.learningH,
        max: w.max,
      })),
      activeUsersList,
      learningListJson: JSON.stringify(activeUsersList),
    });
  }

  @Roles('super_admin')
  @Sse('api/learning/stream')
  learningStream(): Observable<any> {
    return this.userActivityService.learningStream();
  }
}