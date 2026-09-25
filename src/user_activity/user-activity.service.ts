import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Request } from 'express';
import {
  from,
  fromEvent,
  interval,
  merge,
  switchMap,
  debounceTime,
  map,
} from 'rxjs';
import { UserActivity } from 'src/entities/user_activity.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Material } from 'src/entities/materials.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { format, startOfDay, subDays } from 'date-fns';
import { matchLearningScope, ScopeContext } from './learning-scope';

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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
  hasAttended: boolean;
  attendanceLabel: string;
  hasSubmittedAssignment: boolean;
  assignmentLabel: string;
  hasCompletedQuiz: boolean;
  quizLabel: string;
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
    @InjectRepository(Syllabus)
    private readonly syllabusRepository: Repository<Syllabus>,
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
      syllabusRepo: this.syllabusRepository,
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
        !activity.lastSeenAt ||
        activity.lastSeenAt.getTime() < staleCutoff.getTime();
      activity.sessionId = sessionId ?? activity.sessionId;
      activity.lastSeenAt = now;
      if (isStale) {
        activity.loginAt = now;
      }
    }

    await this.activityRepository.save(activity);
    this.events.emit(EVENT_LEARNING_UPDATED);
  }

  async touch(userId: string) {
    if (!userId) return;
    await this.activityRepository.update(
      { userId },
      { lastSeenAt: new Date() },
    );
  }

  async markInactive(userId: string) {
    if (!userId) return;
    await this.activityRepository.delete({ userId });
    this.events.emit(EVENT_LEARNING_UPDATED);
  }

  async purgeExpired(maxAgeMinutes = 60) {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    const stale = await this.activityRepository.find({
      where: { lastSeenAt: LessThan(cutoff) },
    });

    if (stale.length === 0) return;

    const staleIds = stale.map((row) => row.id);
    await this.activityRepository.delete(staleIds);
    this.events.emit(EVENT_LEARNING_UPDATED);
  }

  /**
   * Dipanggil middleware global untuk setiap request.
   * - role 'user' + endpoint dalam scope pembelajaran  => set currentCourseId + label.
   * - role 'user' + navigasi eksplisit ke luar scope   => reset currentCourseId + label.
   * - role lain / background request non-exit         => cukup update lastSeenAt.
   */
  async handleRequest(user: any, req: Request) {
    if (!user?.id) return;
    if (user.role !== 'user') {
      await this.touch(user.id);
      return;
    }

    const method = (req.method ?? 'GET').toUpperCase();
    const rawUrl = req.originalUrl || req.url || req.path || '/';
    const path = rawUrl.split('?')[0];

    const matched = matchLearningScope(method, path);

    if (matched) {
      let courseId: string | null = null;
      let label: string | null = null;

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
        // Gagal resolve scope !== crash request.
      }

      if (courseId) {
        await this.updateActivity(user.id, courseId, label);
        return;
      }
    }

    // Jika tidak cocok dengan learning scope:
    // Hanya reset courseId jika student membuka halaman non-learning utama secara eksplisit
    // (misal: /dashboard, /users/profile tanpa tab belajar, /logout, dll.)
    const tab = ((req.query?.tab as string) || '').toLowerCase();
    const isLearningProfile =
      /^\/users\/profile/i.test(path) &&
      [
        'uiux',
        'presentation',
        'assignment',
        'quiz',
        'logbook',
        'group-class',
        'quiz-start',
      ].includes(tab);

    const isExplicitExit =
      !isLearningProfile &&
      /^\/(dashboard|users\/profile|portfolios|payments|history|alumni|login|register)(\/|$)/i.test(
        path,
      );

    if (isExplicitExit) {
      await this.updateActivity(user.id, null, null);
    } else {
      // Background request atau aset atau sub-halaman lain tidak boleh menghapus status belajar
      await this.touch(user.id);
    }
  }

  private async updateActivity(
    userId: string,
    courseId: string | null,
    label: string | null,
  ) {
    const now = new Date();
    const activity = await this.activityRepository.findOne({
      where: { userId },
    });

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
  async getActiveParticipants(
    thresholdMinutes = 5,
  ): Promise<ActiveParticipant[]> {
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
        lastSeenHuman: this.humanize(a.lastSeenAt),
        bgColor: palette.bg,
        textColor: palette.text,
      };
    });
  }

  /** User yang saat ini sedang belajar = role user, lastSeenAt segar, dan currentCourseId terisi. */
  async getCurrentlyLearning(
    thresholdMinutes = 5,
  ): Promise<LearningParticipant[]> {
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

    const userIds = activities.map((a) => a.userId);
    const courseIds = Array.from(
      new Set(
        activities
          .map((a) => a.currentCourseId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    // Batch query untuk memeriksa absensi, tugas, dan kuis secara parallel
    const [
      attendances,
      assignmentsTotal,
      assignmentsSubmitted,
      quizzesTotal,
      quizzesCompleted,
    ] = await Promise.all([
      // 1. Data kehadiran user
      userIds.length > 0 && courseIds.length > 0
        ? this.activityRepository.manager.query(
            `
          SELECT a."userId", w."courseId", a.status
          FROM attendance a
          JOIN session s ON a."sessionId" = s.id
          JOIN weeks w ON s."weeksId" = w.id
          WHERE a."userId" IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})
            AND w."courseId" IN (${courseIds.map((_, i) => `$${userIds.length + i + 1}`).join(',')})
        `,
            [...userIds, ...courseIds],
          )
        : Promise.resolve([]),

      // 2. Total tugas yang ada di course
      courseIds.length > 0
        ? this.activityRepository.manager.query(
            `
          SELECT w."courseId", COUNT(a.id)::int as total
          FROM assignments a
          JOIN session s ON a."sessionId" = s.id
          JOIN weeks w ON s."weeksId" = w.id
          WHERE w."courseId" IN (${courseIds.map((_, i) => `$${i + 1}`).join(',')})
          GROUP BY w."courseId"
        `,
            courseIds,
          )
        : Promise.resolve([]),

      // 3. Tugas yang sudah dikumpulkan user
      userIds.length > 0 && courseIds.length > 0
        ? this.activityRepository.manager.query(
            `
          SELECT at."userId", w."courseId", COUNT(DISTINCT at."taskId")::int as submitted
          FROM answer_task at
          JOIN assignments a ON at."taskId" = a.id
          JOIN session s ON a."sessionId" = s.id
          JOIN weeks w ON s."weeksId" = w.id
          WHERE at."userId" IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})
            AND w."courseId" IN (${courseIds.map((_, i) => `$${userIds.length + i + 1}`).join(',')})
          GROUP BY at."userId", w."courseId"
        `,
            [...userIds, ...courseIds],
          )
        : Promise.resolve([]),

      // 4. Total quiz yang ada di course
      courseIds.length > 0
        ? this.activityRepository.manager.query(
            `
          SELECT w."courseId", COUNT(q.id)::int as total
          FROM quiz q
          JOIN weeks w ON q."weeksId" = w.id
          WHERE w."courseId" IN (${courseIds.map((_, i) => `$${i + 1}`).join(',')})
          GROUP BY w."courseId"
        `,
            courseIds,
          )
        : Promise.resolve([]),

      // 5. Quiz yang sudah diselesaikan user
      userIds.length > 0 && courseIds.length > 0
        ? this.activityRepository.manager.query(
            `
          SELECT sc."userId", w."courseId", COUNT(DISTINCT sc."quizId")::int as completed
          FROM scores sc
          JOIN quiz q ON sc."quizId" = q.id
          JOIN weeks w ON q."weeksId" = w.id
          WHERE sc."userId" IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})
            AND w."courseId" IN (${courseIds.map((_, i) => `$${userIds.length + i + 1}`).join(',')})
          GROUP BY sc."userId", w."courseId"
        `,
            [...userIds, ...courseIds],
          )
        : Promise.resolve([]),
    ]);

    const attendanceMap = new Set(
      attendances.map((a: any) => `${a.userId}:${a.courseId}`),
    );

    const assignTotalMap = new Map<string, number>(
      assignmentsTotal.map((r: any) => [r.courseId, Number(r.total) || 0]),
    );
    const assignSubMap = new Map<string, number>(
      assignmentsSubmitted.map((r: any) => [
        `${r.userId}:${r.courseId}`,
        Number(r.submitted) || 0,
      ]),
    );

    const quizTotalMap = new Map<string, number>(
      quizzesTotal.map((r: any) => [r.courseId, Number(r.total) || 0]),
    );
    const quizCompMap = new Map<string, number>(
      quizzesCompleted.map((r: any) => [
        `${r.userId}:${r.courseId}`,
        Number(r.completed) || 0,
      ]),
    );

    return activities.map((a, index) => {
      const u = a.user as any;
      const username = u?.username ?? '';
      const courseId = a.currentCourseId ?? '';
      const palette = colorFor(index);
      const userCourseKey = `${a.userId}:${courseId}`;

      // Status Absensi
      const hasAttended = attendanceMap.has(userCourseKey);
      const attendanceLabel = hasAttended ? 'Sudah Absen' : 'Belum Absen';

      // Status Tugas / Assignment
      const totalAssign = assignTotalMap.get(courseId) ?? 0;
      const subAssign = assignSubMap.get(userCourseKey) ?? 0;
      let hasSubmittedAssignment = false;
      let assignmentLabel = 'Belum Tugas';
      if (totalAssign === 0) {
        hasSubmittedAssignment = true;
        assignmentLabel = 'Tidak Ada Tugas';
      } else if (subAssign >= totalAssign) {
        hasSubmittedAssignment = true;
        assignmentLabel = 'Tugas Selesai';
      } else {
        hasSubmittedAssignment = false;
        assignmentLabel = `Tugas (${subAssign}/${totalAssign})`;
      }

      // Status Quiz
      const totalQuiz = quizTotalMap.get(courseId) ?? 0;
      const compQuiz = quizCompMap.get(userCourseKey) ?? 0;
      let hasCompletedQuiz = false;
      let quizLabel = 'Belum Quiz';
      if (totalQuiz === 0) {
        hasCompletedQuiz = true;
        quizLabel = 'Tidak Ada Quiz';
      } else if (compQuiz >= totalQuiz) {
        hasCompletedQuiz = true;
        quizLabel = 'Quiz Selesai';
      } else {
        hasCompletedQuiz = false;
        quizLabel = `Quiz (${compQuiz}/${totalQuiz})`;
      }

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
        hasAttended,
        attendanceLabel,
        hasSubmittedAssignment,
        assignmentLabel,
        hasCompletedQuiz,
        quizLabel,
      };
    });
  }

  /** Memicu update real-time ke semua klien SSE yang sedang mendengarkan */
  notifyLearningUpdated() {
    this.events.emit(EVENT_LEARNING_UPDATED);
  }

  /** SSE stream: snapshot awal + push saat ada perubahan + heartbeat tiap 20 detik. */
  learningStream() {
    const snapshot = () => this.getCurrentlyLearning(5);

    const initial = from(snapshot());

    const updates = fromEvent(this.events, EVENT_LEARNING_UPDATED).pipe(
      debounceTime(400),
      switchMap(() => snapshot()),
    );

    const heartbeat = interval(20000).pipe(switchMap(() => snapshot()));

    return merge(initial, updates, heartbeat).pipe(
      map((learners) => ({
        data: JSON.stringify({ learners }),
      })),
    );
  }

  /** SSE stream overview: summary + chart + activeUsers + learners — semua panel dashboard. */
  overviewStream() {
    const THRESHOLD = 5;

    const snapshot = async () => {
      const [summary, chart, activeUsers, learners] = await Promise.all([
        this.getSummaryToday(),
        this.getWeeklyChart(),
        this.getActiveParticipants(THRESHOLD),
        this.getCurrentlyLearning(THRESHOLD),
      ]);
      return { summary, chart, activeUsers, learners };
    };

    const initial = from(snapshot());
    const updates = fromEvent(this.events, EVENT_LEARNING_UPDATED).pipe(
      debounceTime(400),
      switchMap(() => snapshot()),
    );
    const heartbeat = interval(20000).pipe(switchMap(() => snapshot()));

    return merge(initial, updates, heartbeat).pipe(
      map((data) => ({ data: JSON.stringify(data) })),
    );
  }

  async getWeeklyChart(): Promise<WeeklyStat[]> {
    const today = new Date();
    const start = startOfDay(subDays(today, 6));

    // Ambil data login dan user yang aktif belajar per hari selama 7 hari terakhir
    const [loginRows, activeRows] = await Promise.all([
      this.activityRepository.manager.query(
        `
        SELECT TO_CHAR(ua."loginAt", 'YYYY-MM-DD') as day, COUNT(*)::int as count
        FROM user_activity ua
        JOIN "user" u ON ua."userId" = u.id
        WHERE u.role = 'user' AND ua."loginAt" >= $1
        GROUP BY TO_CHAR(ua."loginAt", 'YYYY-MM-DD')
      `,
        [start],
      ),
      this.activityRepository.manager.query(
        `
        SELECT TO_CHAR(activity_day, 'YYYY-MM-DD') as day, COUNT(DISTINCT "userId")::int as count
        FROM (
          SELECT a."userId", a."attendanceTime" as activity_day
          FROM attendance a
          WHERE a."attendanceTime" >= $1
          UNION ALL
          SELECT at."userId", at."createdAt" as activity_day
          FROM answer_task at
          WHERE at."createdAt" >= $1
          UNION ALL
          SELECT s."userId", s."createdAt" as activity_day
          FROM scores s
          WHERE s."createdAt" >= $1
          UNION ALL
          SELECT l."userId", l."createdAt" as activity_day
          FROM logbook l
          WHERE l."createdAt" >= $1
        ) combined_learning
        GROUP BY TO_CHAR(activity_day, 'YYYY-MM-DD')
      `,
        [start],
      ),
    ]);

    const loginMap = new Map<string, number>(
      loginRows.map((r: any) => [r.day, Number(r.count) || 0]),
    );
    const activeMap = new Map<string, number>(
      activeRows.map((r: any) => [r.day, Number(r.count) || 0]),
    );

    // Hari ini minimal memiliki nilai keaktifan sesuai user yang sedang belajar saat ini
    const todayKey = format(today, 'yyyy-MM-dd');
    const currentLearners = await this.getCurrentlyLearning(30);
    const currentActiveUsers = await this.getActiveParticipants(30);

    activeMap.set(
      todayKey,
      Math.max(activeMap.get(todayKey) ?? 0, currentLearners.length),
    );
    loginMap.set(
      todayKey,
      Math.max(loginMap.get(todayKey) ?? 0, currentActiveUsers.length),
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
      loginH: Math.round((s.login / max) * 220),
      activeH: Math.round((s.active / max) * 220),
    }));
  }

  async getSummaryToday() {
    const start = startOfDay(new Date());

    // 1. Hitung user yang loginAt-nya hari ini dari user_activity
    const activeTodayRows = await this.activityRepository
      .createQueryBuilder('ua')
      .innerJoin('ua.user', 'user')
      .select('COUNT(DISTINCT ua.userId)', 'count')
      .where('user.role = :role', { role: 'user' })
      .andWhere('ua.loginAt >= :start', { start })
      .getRawOne();

    // 2. User online sekarang
    const activeParticipants = await this.getActiveParticipants(5);

    // 3. Mentor yang aktif / terdaftar
    const [mentorUserRows, mentorTableRows] = await Promise.all([
      this.activityRepository.manager.query(`
        SELECT COUNT(DISTINCT id)::int as count FROM "user" WHERE role = 'admin'
      `),
      this.activityRepository.manager.query(`
        SELECT COUNT(DISTINCT id)::int as count FROM mentors
      `),
    ]);
    const adminMentorCount = Number(mentorUserRows[0]?.count) || 0;
    const mentorTableCount = Number(mentorTableRows[0]?.count) || 0;
    const activeMentors = Math.max(adminMentorCount, mentorTableCount);

    return {
      activeToday: Number(activeTodayRows?.count ?? 0),
      onlineNow: activeParticipants.length,
      activeMentors,
    };
  }
}
