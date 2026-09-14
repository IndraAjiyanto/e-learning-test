import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { UserActivity } from 'src/entities/user_activity.entity';
import { ActivityLog } from 'src/entities/activity_log.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { format, startOfDay, subDays } from 'date-fns';

const DAY_LABELS = [
  'Min',
  'Sen',
  'Sel',
  'Rab',
  'Kam',
  'Jum',
  'Sab',
];

export interface ActiveParticipant {
  id: string;
  username: string;
  profile: string | null;
  email: string;
  loginAt: Date;
  lastSeenAt: Date;
  initials: string;
  program: string;
}

export interface WeeklyStat {
  key: string;
  label: string;
  login: number;
  active: number;
  loginH: number;
  activeH: number;
  max: number;
}

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
  ) {}

  async markActive(userId: string, sessionId?: string) {
    if (!userId) return;
    const now = new Date();
    const staleCutoff = new Date(Date.now() - 60 * 60 * 1000);

    let activity = await this.activityRepository.findOne({
      where: { userId },
    });

    if (!activity) {
      activity = this.activityRepository.create({
        userId,
        sessionId: sessionId ?? null,
        loginAt: now,
        lastSeenAt: now,
      });
    } else {
      const isStale =
        !activity.lastSeenAt || activity.lastSeenAt.getTime() < staleCutoff.getTime();
      activity.sessionId = sessionId ?? activity.sessionId;
      activity.lastSeenAt = now;
      if (isStale) {
        activity.loginAt = now;
      }
    }

    await this.activityRepository.save(activity);
    await this.logActivity(userId, 'login', now);
  }

  async touch(userId: string) {
    if (!userId) return;
    await this.activityRepository.update({ userId }, { lastSeenAt: new Date() });
  }

  async markInactive(userId: string) {
    if (!userId) return;
    await this.logActivity(userId, 'logout', new Date());
    await this.activityRepository.delete({ userId });
  }

  async purgeExpired(maxAgeMinutes = 60) {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    const stale = await this.activityRepository.find({
      where: { lastSeenAt: LessThan(cutoff) },
    });

    if (stale.length === 0) return;

    const now = new Date();
    const events = stale.map((row) =>
      this.activityLogRepository.create({
        userId: row.userId,
        eventType: 'expired',
        eventAt: now,
      }),
    );
    await this.activityLogRepository.save(events);

    const staleIds = stale.map((row) => row.id);
    await this.activityRepository.delete(staleIds);
  }

  private async logActivity(userId: string, eventType: 'login' | 'logout' | 'expired', eventAt: Date) {
    await this.activityLogRepository.save(
      this.activityLogRepository.create({ userId, eventType, eventAt }),
    );
  }

  async getActiveParticipants(thresholdMinutes = 5): Promise<ActiveParticipant[]> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    const activities = await this.activityRepository
      .createQueryBuilder('ua')
      .innerJoinAndSelect('ua.user', 'user')
      .where('user.role = :role', { role: 'user' })
      .andWhere('ua.lastSeenAt >= :threshold', { threshold })
      .orderBy('ua.lastSeenAt', 'DESC')
      .getMany();

    if (activities.length === 0) return [];

    const userIds = activities.map((a) => a.userId);
    const userCourses = await this.userCourseRepository.find({
      where: { user: In(userIds) },
      relations: { course: true, user: true },
    });

    const programByUser = new Map<string, string>();
    for (const uc of userCourses) {
      const uid = uc.user?.id;
      if (uid && !programByUser.has(uid)) {
        programByUser.set(uid, uc.course?.name ?? '');
      }
    }

    return activities.map((a) => {
      const u = a.user as any;
      const username = u?.username ?? '';
      return {
        id: a.userId,
        username,
        profile: u?.profile ?? null,
        email: u?.email ?? '',
        loginAt: a.loginAt,
        lastSeenAt: a.lastSeenAt,
        initials: username ? username.substring(0, 2).toUpperCase() : 'NA',
        program: programByUser.get(a.userId) ?? '',
      };
    });
  }

  async getWeeklyChart(): Promise<WeeklyStat[]> {
    const today = new Date();
    const start = startOfDay(subDays(today, 6));

    const loginRows = await this.activityLogRepository
      .createQueryBuilder('al')
      .innerJoin('al.user', 'user')
      .select("TO_CHAR(al.eventAt, 'YYYY-MM-DD')", 'day')
      .addSelect('COUNT(*)', 'count')
      .where('al.eventType = :type', { type: 'login' })
      .andWhere('al.eventAt >= :start', { start })
      .andWhere('user.role = :role', { role: 'user' })
      .groupBy("TO_CHAR(al.eventAt, 'YYYY-MM-DD')")
      .getRawMany();

    const activeRows = await this.activityLogRepository
      .createQueryBuilder('al')
      .innerJoin('al.user', 'user')
      .select("TO_CHAR(al.eventAt, 'YYYY-MM-DD')", 'day')
      .addSelect('COUNT(DISTINCT al.userId)', 'count')
      .where('al.eventAt >= :start', { start })
      .andWhere('user.role = :role', { role: 'user' })
      .groupBy("TO_CHAR(al.eventAt, 'YYYY-MM-DD')")
      .getRawMany();

    const loginMap = new Map<string, number>(
      loginRows.map((r) => [r.day, Number(r.count) ?? 0]),
    );
    const activeMap = new Map<string, number>(
      activeRows.map((r) => [r.day, Number(r.count) ?? 0]),
    );

    const stats = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(today, 6 - i));
      const key = format(date, 'yyyy-MM-dd');
      return {
        key,
        label: DAY_LABELS[date.getDay()],
        login: loginMap.get(key) ?? 0,
        active: activeMap.get(key) ?? 0,
      };
    });

    const max = Math.max(...stats.map((s) => Math.max(s.login, s.active)), 1);
    return stats.map((s) => ({
      ...s,
      max,
      loginH: Math.round((s.login / max) * 265),
      activeH: Math.round((s.active / max) * 265),
    }));
  }

  async getSummaryToday() {
    const start = startOfDay(new Date());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

    const activeToday = await this.activityLogRepository
      .createQueryBuilder('al')
      .innerJoin('al.user', 'user')
      .select('COUNT(DISTINCT al.userId)', 'count')
      .where('user.role = :role', { role: 'user' })
      .andWhere('al.eventAt >= :start', { start })
      .andWhere('al.eventAt <= :end', { end })
      .getRawOne();

    const activeParticipants = await this.getActiveParticipants(5);

    return {
      activeToday: Number(activeToday?.count ?? 0),
      onlineNow: activeParticipants.length,
    };
  }
}