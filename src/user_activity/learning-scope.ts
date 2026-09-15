import { Request } from 'express';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Material } from 'src/entities/materials.entity';
import { UserCourse } from 'src/entities/user_course.entity';

export interface ScopeContext {
  sessionRepo: Repository<Session>;
  quizRepo: Repository<Quiz>;
  weeksRepo: Repository<Weeks>;
  logbookRepo: Repository<Logbook>;
  materialRepo: Repository<Material>;
  userCourseRepo: Repository<UserCourse>;
}

export interface ScopeResolution {
  courseId: string;
  label: string;
}

export interface LearningScopeRule {
  name: string;
  method: 'GET' | 'POST' | 'ALL';
  /** Regex path. Group names (sessionId/quizId/weeksId/courseId/logbookId/id) dipakai untuk extract id. */
  match: RegExp;
  resolve: (ids: Record<string, string>, req: Request, ctx: ScopeContext) => Promise<ScopeResolution | null>;
}

async function resolveSession(
  ids: Record<string, string>,
  ctx: ScopeContext,
  label: string,
): Promise<ScopeResolution | null> {
  const id = ids.sessionId || ids.id;
  if (!id) return null;
  const session = await ctx.sessionRepo.findOne({
    where: { id },
    relations: ['weeks', 'weeks.course'],
  });
  const courseId = session?.weeks?.course?.id;
  return courseId ? { courseId, label } : null;
}

async function resolveQuiz(
  ids: Record<string, string>,
  ctx: ScopeContext,
  label: string,
): Promise<ScopeResolution | null> {
  const id = ids.quizId;
  if (!id) return null;
  const quiz = await ctx.quizRepo.findOne({
    where: { id },
    relations: ['weeks', 'weeks.course'],
  });
  const courseId = quiz?.weeks?.course?.id;
  return courseId ? { courseId, label } : null;
}

async function resolveWeeks(
  ids: Record<string, string>,
  ctx: ScopeContext,
): Promise<ScopeResolution | null> {
  const id = ids.weeksId;
  if (!id) return null;
  const week = await ctx.weeksRepo.findOne({
    where: { id },
    relations: ['course'],
  });
  const courseId = week?.course?.id;
  return courseId ? { courseId, label: 'Belajar' } : null;
}

async function resolveMaterial(
  ids: Record<string, string>,
  ctx: ScopeContext,
): Promise<ScopeResolution | null> {
  const id = ids.id;
  if (!id) return null;
  const material = await ctx.materialRepo.findOne({
    where: { id },
    relations: ['session', 'session.weeks', 'session.weeks.course'],
  });
  const courseId = material?.session?.weeks?.course?.id;
  return courseId ? { courseId, label: 'Materi' } : null;
}

async function resolveLogbook(
  ids: Record<string, string>,
  ctx: ScopeContext,
): Promise<ScopeResolution | null> {
  const id = ids.logbookId;
  if (!id) return null;
  const logbook = await ctx.logbookRepo.findOne({
    where: { id },
    relations: ['session', 'session.weeks', 'session.weeks.course'],
  });
  const courseId = logbook?.session?.weeks?.course?.id;
  return courseId ? { courseId, label: 'Logbook' } : null;
}

/**
 * Daftar endpoint yang dianggap berada dalam "scope proses pembelajaran".
 * Selama user (role 'user') membuka endpoint ini, dia dihitung sebagai
 * "sedang belajar <course>" (disimpan di user_activity.currentCourseId).
 * Saat user membuka endpoint di luar daftar ini, status belajar di-reset.
 *
 * Catatan: middleware ini global (app.use), jadi req.params tidak tersedia
 * (routing belum berjalan). Semua extract id dilakukan dari req.path via
 * named group pada `match`.
 */
export const LEARNING_SCOPE: LearningScopeRule[] = [
  {
    name: 'material-viewer',
    method: 'GET',
    match: /^\/learning-material\/(?:video|pdf|ppt)\/(?<sessionId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Materi'),
  },
  {
    name: 'material-detail',
    method: 'GET',
    match: /^\/learning-material\/(?<id>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveMaterial(ids, ctx),
  },
  {
    name: 'quiz-form',
    method: 'GET',
    match: /^\/quiz\/form\/(?<quizId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveQuiz(ids, ctx, 'Quiz'),
  },
  {
    name: 'quiz-start',
    method: 'GET',
    match: /^\/quiz\/start\/(?<quizId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveQuiz(ids, ctx, 'Quiz'),
  },
  {
    name: 'answer-users',
    method: 'POST',
    match: /^\/answer-users\/(?<quizId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveQuiz(ids, ctx, 'Quiz'),
  },
  {
    name: 'answer-assigment',
    method: 'ALL',
    match: /^\/answer-assigment\/[^/]+\/(?<sessionId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Tugas'),
  },
  {
    name: 'attendance-form',
    method: 'GET',
    match: /^\/attendance\/form\/(?<id>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Absensi'),
  },
  {
    name: 'attendance-create',
    method: 'POST',
    match: /^\/attendance\/[^/]+\/[^/]+\/(?<courseId>[^/]+)$/,
    resolve: async (ids) => (ids.courseId ? { courseId: ids.courseId, label: 'Absensi' } : null),
  },
  {
    name: 'questions-quiz',
    method: 'GET',
    match: /^\/question\/quiz\/[^/]+\/(?<courseId>[^/]+)$/,
    resolve: async (ids) => (ids.courseId ? { courseId: ids.courseId, label: 'Quiz' } : null),
  },
  {
    name: 'program-session',
    method: 'GET',
    match: /^\/program\/session\/(?<weeksId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveWeeks(ids, ctx),
  },
  {
    name: 'program-quiz',
    method: 'GET',
    match: /^\/program\/quiz\/(?<weeksId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveWeeks(ids, ctx),
  },
  {
    name: 'program-myProgram',
    method: 'GET',
    match: /^\/program\/myProgram\/(?<userId>[^/]+)(?:\/fragment.*)?$/,
    resolve: async (ids, req, ctx) => {
      const byQuery = req.query?.courseId;
      const courseId = Array.isArray(byQuery) ? byQuery[0] : byQuery;
      if (typeof courseId === 'string' && courseId) {
        return { courseId, label: 'Belajar' };
      }
      if (!ids.userId) return null;
      const uc = await ctx.userCourseRepo.findOne({
        where: { user: { id: ids.userId } },
        relations: ['course'],
      });
      return uc?.course?.id
        ? { courseId: uc.course.id, label: 'Belajar' }
        : null;
    },
  },
  {
    name: 'logbook-user',
    method: 'GET',
    match: /^\/logbooks\/user\/(?<courseId>[^/]+)$/,
    resolve: async (ids) => (ids.courseId ? { courseId: ids.courseId, label: 'Logbook' } : null),
  },
  {
    name: 'logbook-formCreate',
    method: 'GET',
    match: /^\/logbooks\/formCreate\/[^/]+\/(?<courseId>[^/]+)$/,
    resolve: async (ids) => (ids.courseId ? { courseId: ids.courseId, label: 'Logbook' } : null),
  },
  {
    name: 'logbook-detail',
    method: 'GET',
    match: /^\/logbooks\/(?<logbookId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveLogbook(ids, ctx),
  },
];

/** Mengembalikan rule scope yang cocok dengan method + path, atau null jika di luar scope. */
export function matchLearningScope(method: string, path: string): { rule: LearningScopeRule; ids: Record<string, string> } | null {
  for (const rule of LEARNING_SCOPE) {
    const okMethod = rule.method === 'ALL' || rule.method === method;
    if (!okMethod) continue;
    const m = rule.match.exec(path);
    if (!m) continue;
    const ids = (m.groups ?? {}) as Record<string, string>;
    return { rule, ids };
  }
  return null;
}