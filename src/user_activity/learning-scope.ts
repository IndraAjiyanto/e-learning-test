import { Request } from 'express';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Material } from 'src/entities/materials.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { FinalAssignment } from 'src/entities/final_assignment.entity';

export interface ScopeContext {
  sessionRepo: Repository<Session>;
  quizRepo: Repository<Quiz>;
  weeksRepo: Repository<Weeks>;
  logbookRepo: Repository<Logbook>;
  materialRepo: Repository<Material>;
  userCourseRepo: Repository<UserCourse>;
  syllabusRepo?: Repository<Syllabus>;
  finalAssignmentRepo?: Repository<FinalAssignment>;
}

export interface ScopeResolution {
  courseId: string;
  label: string;
}

export interface LearningScopeRule {
  name: string;
  method: 'GET' | 'POST' | 'ALL';
  /** Regex path. Group names (sessionId/quizId/weeksId/courseId/logbookId/id) are used to extract id. */
  match: RegExp;
  resolve: (
    ids: Record<string, string>,
    req: Request,
    ctx: ScopeContext,
  ) => Promise<ScopeResolution | null>;
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
  return courseId ? { courseId, label: 'Learning' } : null;
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
  return courseId ? { courseId, label: 'Material' } : null;
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

async function resolveSyllabus(
  ids: Record<string, string>,
  ctx: ScopeContext,
  label: string,
): Promise<ScopeResolution | null> {
  const id = ids.syllabusId;
  if (!id || !ctx.syllabusRepo) return null;
  const syllabus = await ctx.syllabusRepo.findOne({
    where: { id },
    relations: ['course'],
  });
  const courseId = syllabus?.course?.id;
  return courseId ? { courseId, label } : null;
}

async function resolveFinalAssignment(
  ids: Record<string, string>,
  ctx: ScopeContext,
): Promise<ScopeResolution | null> {
  const id = ids.finalAssignmentId;
  if (!id || !ctx.finalAssignmentRepo) return null;
  const finalAssignment = await ctx.finalAssignmentRepo.findOne({
    where: { id },
    relations: ['course'],
  });
  const courseId = finalAssignment?.courseId;
  return courseId ? { courseId, label: 'Final Assignment' } : null;
}

export const LEARNING_SCOPE: LearningScopeRule[] = [
  {
    name: 'syllabus-detail',
    method: 'GET',
    match: /^\/syllabus\/learn\/(?<syllabusId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSyllabus(ids, ctx, 'Syllabus'),
  },
  {
    name: 'material-viewer',
    method: 'GET',
    match: /^\/learning-material\/(?:video|pdf|ppt)\/(?<sessionId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Material'),
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
    name: 'final-assignment-submission',
    method: 'GET',
    match: /^\/final-assignment\/submission\/(?<finalAssignmentId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveFinalAssignment(ids, ctx),
  },
  {
    name: 'answer-assigment',
    method: 'ALL',
    match: /^\/answer-assigment\/(?<sessionId>[^/]+)(?:\/[^/]+)?$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Assignment'),
  },
  {
    name: 'direct-session',
    method: 'GET',
    match: /^\/session\/(?<sessionId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Session Material'),
  },
  {
    name: 'attendance-form',
    method: 'GET',
    match: /^\/attendance\/(?:form|create)\/(?<id>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Attendance'),
  },
  {
    name: 'attendance-create',
    method: 'POST',
    match: /^\/attendance\/(?<sessionId>[^/]+)\/[^/]+\/(?<courseId>[^/]+)$/,
    resolve: (ids) =>
      Promise.resolve(
        ids.courseId ? { courseId: ids.courseId, label: 'Attendance' } : null,
      ),
  },
  {
    name: 'questions-quiz',
    method: 'GET',
    match: /^\/question\/quiz\/[^/]+\/(?<courseId>[^/]+)$/,
    resolve: (ids) =>
      Promise.resolve(
        ids.courseId ? { courseId: ids.courseId, label: 'Quiz' } : null,
      ),
  },
  {
    name: 'program-session-detail',
    method: 'GET',
    match: /^\/program\/session\/detail\/(?<sessionId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Session Material'),
  },
  {
    name: 'program-course-detail',
    method: 'GET',
    match:
      /^\/program\/(?:program\/detail\/|detail\/)?(?<courseId>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
    resolve: (ids) =>
      Promise.resolve(
        ids.courseId
          ? { courseId: ids.courseId, label: 'Viewing Program' }
          : null,
      ),
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
        return { courseId, label: 'Learning' };
      }
      if (!ids.userId) return null;
      const uc = await ctx.userCourseRepo.findOne({
        where: { user: { id: ids.userId } },
        relations: ['course'],
      });
      return uc?.course?.id
        ? { courseId: uc.course.id, label: 'Learning' }
        : null;
    },
  },
  {
    name: 'logbook-user',
    method: 'GET',
    match: /^\/logbooks\/user\/(?<courseId>[^/]+)$/,
    resolve: (ids) =>
      Promise.resolve(
        ids.courseId ? { courseId: ids.courseId, label: 'Logbook' } : null,
      ),
  },
  {
    name: 'logbook-formCreate',
    method: 'GET',
    match: /^\/logbooks\/formCreate\/[^/]+\/(?<courseId>[^/]+)$/,
    resolve: (ids) =>
      Promise.resolve(
        ids.courseId ? { courseId: ids.courseId, label: 'Logbook' } : null,
      ),
  },
  {
    name: 'logbook-formEdit',
    method: 'GET',
    match: /^\/logbooks\/formEdit\/(?<logbookId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveLogbook(ids, ctx),
  },
  {
    name: 'logbook-create',
    method: 'POST',
    match: /^\/logbooks\/(?<sessionId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveSession(ids, ctx, 'Logbook'),
  },
  {
    name: 'logbook-detail',
    method: 'ALL',
    match: /^\/logbooks\/(?<logbookId>[^/]+)$/,
    resolve: (ids, _req, ctx) => resolveLogbook(ids, ctx),
  },
  {
    name: 'users-profile-learning',
    method: 'GET',
    match: /^\/users\/profile$/,
    resolve: async (_ids, req, ctx) => {
      const tab = (req.query?.tab as string) || '';
      const learningTabs = [
        'uiux',
        'presentation',
        'assignment',
        'quiz',
        'logbook',
        'group-class',
        'quiz-start',
      ];
      if (!learningTabs.includes(tab)) return null;

      const byQuery = req.query?.courseId;
      const courseId = Array.isArray(byQuery) ? byQuery[0] : byQuery;
      const user = req.user;
      if (typeof courseId === 'string' && courseId) {
        return { courseId, label: 'Learning' };
      }
      if (!user?.id) return null;
      const uc = await ctx.userCourseRepo.findOne({
        where: { user: { id: user.id } },
        relations: ['course'],
      });
      return uc?.course?.id
        ? { courseId: uc.course.id, label: 'Learning' }
        : null;
    },
  },
];

export function isAssetPath(path: string): boolean {
  return (
    path.startsWith('/public/') ||
    path.startsWith('/uploads/') ||
    path.startsWith('/asset/') ||
    path === '/favicon.ico' ||
    /\.(css|js|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|eot|map|json)$/i.test(path)
  );
}

export function isNavigationRequest(req: Request): boolean {
  const dest = req.headers['sec-fetch-dest'];
  if (typeof dest === 'string') return dest === 'document';
  const mode = req.headers['sec-fetch-mode'];
  if (typeof mode === 'string') return mode === 'navigate';
  const accept = req.headers.accept ?? '';
  return (
    (req.method ?? 'GET').toUpperCase() === 'GET' &&
    accept.includes('text/html')
  );
}

export function matchLearningScope(
  method: string,
  path: string,
): { rule: LearningScopeRule; ids: Record<string, string> } | null {
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
