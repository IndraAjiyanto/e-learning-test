import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThan, Repository } from 'typeorm';
import { Request } from 'express';
import { from, fromEvent, interval, merge, switchMap, debounceTime, map } from 'rxjs';
import { UserActivity } from 'src/entities/user_activity.entity';
import { ActivityLog } from 'src/entities/activity_log.entity';
import { DailyStatistics } from 'src/entities/daily_statistics.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Material } from 'src/entities/materials.entity';
import { format, startOfDay, subDays } from 'date-fns';
import { isAssetPath, matchLearningScope, ScopeContext } from './learning-scope';

const DAY_LABELS = [
  'Min',
  'Sen',
  'Sel',
  'Rab',
  'Kam',
  'Jum',
  'Sab',
];

const EVENT_LEARNING_UPDATED = 'learning.updated';

export interface ActiveParticipant {
  id: string;
  name: string;
  username: string;
  profile: string | null;
  email: string;
  loginAt: Date;
  lastSeenAt: Date;
  initials: string;
  program: string;
  courseId: string;
  courseName: string;
  activityLabel: string;
  isLearning: boolean;
  lastSeenHuman: string;
  bgColor: string;
  textColor: string;
}

export interface LearningParticipant {
  userId: string;
  name: string;
  initials: string;
  profile: string | null;
  email: string;
  courseId: string;
  courseName: string;
  activityLabel: string;
  lastSeenAt: Date;
  lastSeenHuman: string;
  bgColor: string;
  textColor: string;
}

export interface WeeklyStat {
  key: string;
  label: string;
  login: number;
  active: number;
  learning: number;
  loginH: number;
  activeH: number;
  learningH: number;
  max: number;
}

const PALETTE = [
  { bg: '#EAF1FF', text: '#396FE8' },
  { bg: '#E8F8F2', text: '#1D9A6C' },
  { bg: '#FFF5E3', text: '#F2A43A' },
  { bg: '#F0ECFF', text: '#7B61D9' },
  { bg: '#FFEEF3', text: '#E0527B' },
  { bg: '#EAF7FC', text: '#1BA3C3' },
];

function colorFor(index: number) {
  return PALETTE[index % PALETTE.length];
}

@Injectable()
export class UserActivityService {
  private readonly events = new EventEmitter();

  constructor(
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(DailyStatistics)
    private readonly dailyStatsRepository: Repository<DailyStatistics>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Weeks)
    private readonly weeksRepository: Repository<Weeks>,
    @InjectRepository(Logbook)
    private readonly logbookRepository: Repository<Logbook>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {
    this.events.setMaxListeners(0);
  }

  private scopeContext(): ScopeContext {
    return {
      sessionRepo: this.sessionRepository,
      quizRepo: this.quizRepository,
      weeksRepo: this.weeksRepository,
      logbookRepo: this.logbookRepository,
      materialRepo: this.materialRepository,
      userCourseRepo: this.userCourseRepository,
    };
  }

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
        currentCourseId: null,
        activityLabel: null,
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

  /**
   * Dipanggil middleware global untuk setiap request.
   * - role 'user' + endpoint dalam scope pembelajaran  => set currentCourseId + label.
   * - role 'user' + endpoint di luar scope              => reset currentCourseId + label (tidak belajar).
   * - role lain                                        => cukup update lastSeenAt.
   */
  async handleRequest(user: any, req: Request) {
    if (!user?.id) return;
    if (user.role !== 'user') {
      await this.touch(user.id);
      return;
    }

    const method = (req.method ?? 'GET').toUpperCase();
    const url = new URL(req.originalUrl || req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;

    // Request asset/static (CSS/JS/gambar/favicon) hanya update lastSeenAt,
    // JANGAN reset status belajar agar tidak hilang seketika saat halaman dimuat.
    if (isAssetPath(path)) {
      await this.touch(user.id);
      return;
    }

    const matched = matchLearningScope(method, path);

    let courseId: string | null = null;
    let label: string | null = null;

    if (matched) {
      try {
        const resolution = await matched.rule.resolve(
          matched.ids,
          req as any,
          this.scopeContext(),
        );
        if (resolution) {
          courseId = resolution.courseId;
          label = resolution.label;
        }
      } catch (error) {
        // Gagal resolve scope !== crash request; biarkan null (dianggap keluar scope).
      }
    }

    await this.updateActivity(user.id, courseId, label);
  }

  private async updateActivity(
    userId: string,
    courseId: string | null,
    label: string | null,
  ) {
    const now = new Date();
    const activity = await this.activityRepository.findOne({ where: { userId } });

    if (!activity) {
      await this.activityRepository.save(
        this.activityRepository.create({
          userId,
          currentCourseId: courseId,
          activityLabel: label,
          loginAt: now,
          lastSeenAt: now,
        }),
      );
      this.events.emit(EVENT_LEARNING_UPDATED);
      return;
    }

    const changed =
      (activity.currentCourseId ?? null) !== courseId ||
      (activity.activityLabel ?? null) !== label;

    activity.lastSeenAt = now;
    activity.currentCourseId = courseId;
    activity.activityLabel = label;
    await this.activityRepository.save(activity);

    if (changed) {
      this.events.emit(EVENT_LEARNING_UPDATED);
    }
  }

  private humanize(date: Date): string {
    const diff = Math.max(0, Date.now() - new Date(date).getTime());
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec} detik lalu`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} menit lalu`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour} jam lalu`;
    return `${Math.floor(hour / 24)} hari lalu`;
  }

  private async loadCourseNames(ids: string[]): Promise<Map<string, string>> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (unique.length === 0) return new Map();
    const courses = await this.courseRepository.find({
      where: { id: In(unique) },
    });
    return new Map(courses.map((c) => [c.id, c.name]));
  }

  /** User online (role user, lastSeenAt segar) + course yang sedang dipelajari. */
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
    const activeCourseIds = activities
      .map((a) => a.currentCourseId ?? '')
      .filter(Boolean);

    const [userCourses, courseNameById] = await Promise.all([
      this.userCourseRepository.find({
        where: { user: In(userIds) },
        relations: { course: true, user: true },
      }),
      this.loadCourseNames(activeCourseIds),
    ]);

    const enrolledByName = new Map<string, string>();
    for (const uc of userCourses) {
      const uid = uc.user?.id;
      if (uid && !enrolledByName.has(uid)) {
        enrolledByName.set(uid, uc.course?.name ?? '');
      }
    }

    return activities.map((a, index) => {
      const u = a.user as any;
      const username = u?.username ?? '';
      const palette = colorFor(index);
      const courseId = a.currentCourseId ?? '';
      const courseName =
        (courseId ? courseNameById.get(courseId) : '') ||
        enrolledByName.get(a.userId) ||
        '';
      return {
        id: a.userId,
        name: username,
        username,
        profile: u?.profile ?? null,
        email: u?.email ?? '',
        loginAt: a.loginAt,
        lastSeenAt: a.lastSeenAt,
        initials: username ? username.substring(0, 2).toUpperCase() : 'NA',
        program: courseName,
        courseId,
        courseName,
        activityLabel: a.activityLabel ?? '',
        isLearning: !!a.currentCourseId,
        lastSeenHuman: this.humanize(a.lastSeenAt),
        bgColor: palette.bg,
        textColor: palette.text,
      };
    });
  }

  /** User yang saat ini sedang belajar = role user, lastSeenAt segar, dan currentCourseId terisi. */
  async getCurrentlyLearning(thresholdMinutes = 5): Promise<LearningParticipant[]> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    const activities = await this.activityRepository
      .createQueryBuilder('ua')
      .innerJoinAndSelect('ua.user', 'user')
      .where('user.role = :role', { role: 'user' })
      .andWhere('ua.currentCourseId IS NOT NULL')
      .andWhere('ua.lastSeenAt >= :threshold', { threshold })
      .orderBy('ua.lastSeenAt', 'DESC')
      .getMany();

    if (activities.length === 0) return [];

    const courseNameById = await this.loadCourseNames(
      activities.map((a) => a.currentCourseId ?? ''),
    );

    return activities.map((a, index) => {
      const u = a.user as any;
      const username = u?.username ?? '';
      const courseId = a.currentCourseId ?? '';
      const palette = colorFor(index);
      return {
        userId: a.userId,
        name: username,
        initials: username ? username.substring(0, 2).toUpperCase() : 'NA',
        profile: u?.profile ?? null,
        email: u?.email ?? '',
        courseId,
        courseName: courseNameById.get(courseId) ?? '',
        activityLabel: a.activityLabel ?? '',
        lastSeenAt: a.lastSeenAt,
        lastSeenHuman: this.humanize(a.lastSeenAt),
        bgColor: palette.bg,
        textColor: palette.text,
      };
    });
  }

  /** SSE stream: snapshot awal + push saat ada perubahan + heartbeat tiap 20 detik. */
  learningStream() {
    const snapshot = () => this.getActiveParticipants(5);

    const initial = from(snapshot());

    const updates = fromEvent(this.events, EVENT_LEARNING_UPDATED).pipe(
      debounceTime(400),
      switchMap(() => snapshot()),
    );

    const heartbeat = interval(20000).pipe(switchMap(() => snapshot()));

    return merge(initial, updates, heartbeat).pipe(
      map((participants) => ({
        data: JSON.stringify({ participants }),
      })),
    );
  }

  async getWeeklyChart(): Promise<WeeklyStat[]> {
    await this.ensureDailyStats(new Date()).catch(() => undefined);
    const today = new Date();
    const start = startOfDay(subDays(today, 6));

    const [loginRows, statRows] = await Promise.all([
      this.activityLogRepository
        .createQueryBuilder('al')
        .innerJoin('al.user', 'user')
        .select("TO_CHAR(al.eventAt, 'YYYY-MM-DD')", 'day')
        .addSelect('COUNT(DISTINCT al.userId)', 'count')
        .where('al.eventType = :type', { type: 'login' })
        .andWhere('al.eventAt >= :start', { start })
        .andWhere('user.role = :role', { role: 'user' })
        .groupBy("TO_CHAR(al.eventAt, 'YYYY-MM-DD')")
        .getRawMany(),
      this.dailyStatsRepository.find({
        where: {
          statDate: Between(format(start, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')),
        },
      }),
    ]);

    const loginMap = new Map<string, number>(
      loginRows.map((r) => [r.day, Number(r.count) ?? 0]),
    );
    const statMap = new Map<string, DailyStatistics>(
      statRows.map((r) => [r.statDate, r]),
    );

    const stats = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(today, 6 - i));
      const key = format(date, 'yyyy-MM-dd');
      return {
        key,
        label: DAY_LABELS[date.getDay()],
        login: loginMap.get(key) ?? 0,
        active: loginMap.get(key) ?? 0,
        learning: statMap.get(key)?.learningCount ?? 0,
      };
    });

    const max = Math.max(
      ...stats.map((s) => Math.max(s.login, s.learning)),
      1,
    );
    return stats.map((s) => ({
      ...s,
      max,
      loginH: Math.round((s.login / max) * 265),
      activeH: Math.round((s.active / max) * 265),
      learningH: Math.round((s.learning / max) * 265),
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

    const [activeParticipants, learningCount, mentorCount, programCount] =
      await Promise.all([
        this.getActiveParticipants(5),
        this.countCurrentlyLearning(5),
        this.countActiveMentors(5),
        this.countActivePrograms(),
      ]);

    return {
      activeToday: Number(activeToday?.count ?? 0),
      onlineNow: activeParticipants.length,
      learningNow: learningCount,
      mentorActive: mentorCount,
      programActive: programCount,
    };
  }

  /** Mentor aktif (role admin) yang login & session belum expired. */
  async countActiveMentors(thresholdMinutes = 5): Promise<number> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    return this.activityRepository
      .createQueryBuilder('ua')
      .innerJoin('ua.user', 'user')
      .where('user.role = :role', { role: 'admin' })
      .andWhere('ua.lastSeenAt >= :threshold', { threshold })
      .getCount();
  }

  /** Peserta (role user) yang sedang login & session belum expired. */
  async countActiveParticipants(thresholdMinutes = 5): Promise<number> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    return this.activityRepository
      .createQueryBuilder('ua')
      .innerJoin('ua.user', 'user')
      .where('user.role = :role', { role: 'user' })
      .andWhere('ua.lastSeenAt >= :threshold', { threshold })
      .getCount();
  }

  /** User role 'user' yang sedang belajar (currentCourseId terisi) & lastSeenAt segar. */
  private async countCurrentlyLearning(thresholdMinutes = 5): Promise<number> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    return this.activityRepository
      .createQueryBuilder('ua')
      .innerJoin('ua.user', 'user')
      .where('user.role = :role', { role: 'user' })
      .andWhere('ua.currentCourseId IS NOT NULL')
      .andWhere('ua.lastSeenAt >= :threshold', { threshold })
      .getCount();
  }

  /** Program aktif = masih berjalan (approved + periode berlangsung) & belum dituntaskan seluruh pesertanya. */
  async countActivePrograms(): Promise<number> {
    const today = startOfDay(new Date());
    const row = await this.courseRepository
      .createQueryBuilder('course')
      .innerJoin('course.userCourses', 'uc')
      .select('COUNT(DISTINCT course.id)', 'count')
      .where('course.process = :process', { process: 'approved' })
      .andWhere('course.startDate <= :today', { today })
      .andWhere('(course.startEnd IS NULL OR course.startEnd >= :today)')
      .andWhere('uc.progress = :progress', { progress: false })
      .getRawOne();
    return Number(row?.count ?? 0);
  }

  private async countLoginEvents(day: Date): Promise<number> {
    const start = startOfDay(day);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    const row = await this.activityLogRepository
      .createQueryBuilder('al')
      .innerJoin('al.user', 'user')
      .select('COUNT(DISTINCT al.userId)', 'count')
      .where('al.eventType = :type', { type: 'login' })
      .andWhere('al.eventAt >= :start', { start })
      .andWhere('al.eventAt <= :end', { end })
      .andWhere('user.role = :role', { role: 'user' })
      .getRawOne();
    return Number(row?.count ?? 0);
  }

  /**
   * Upsert baris daily_statistics utk tanggal tertentu.
   * - loginCount selalu dihitung ulang dari activity_log (akurat utk hari lalu).
   * - learning/participant/mentor hanya ditulis ulang utk hari ini (real-time snapshot).
   */
  async ensureDailyStats(day: Date = new Date()): Promise<DailyStatistics> {
    await this.purgeExpired(60).catch(() => undefined);
    const key = format(day, 'yyyy-MM-dd');
    const isToday = format(new Date(), 'yyyy-MM-dd') === key;

    let row = await this.dailyStatsRepository.findOne({
      where: { statDate: key },
    });

    const loginCount = await this.countLoginEvents(day);
    const data: Partial<DailyStatistics> = {
      loginCount: Math.max(row?.loginCount ?? 0, loginCount),
    };

    if (isToday) {
      const [learningCount, participantsCount, mentorCount, programCount] =
        await Promise.all([
          this.countCurrentlyLearning(5),
          this.countActiveParticipants(5),
          this.countActiveMentors(5),
          this.countActivePrograms(),
        ]);
      data.learningCount = Math.max(row?.learningCount ?? 0, learningCount);
      data.participantsActiveCount = Math.max(
        row?.participantsActiveCount ?? 0,
        participantsCount,
      );
      data.mentorActiveCount = Math.max(
        row?.mentorActiveCount ?? 0,
        mentorCount,
      );
      data.programActiveCount = programCount;
    }

    if (row) {
      Object.assign(row, data);
      return this.dailyStatsRepository.save(row);
    }

    const created = this.dailyStatsRepository.create({
      statDate: key,
      ...data,
    } as DailyStatistics);
    return this.dailyStatsRepository.save(created);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async snapshotTodayStats() {
    await this.ensureDailyStats(new Date()).catch(() => undefined);
  }

  @Cron('0 5 0 * * *')
  async finalizeYesterdayStats() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.ensureDailyStats(yesterday).catch(() => undefined);
  }
}