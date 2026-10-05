// Single source of truth for sequential session unlock logic.
// See PRD-sequential-session-unlock.md at the repo root.
//
// Rule (PRD §5.1): a session is UNLOCKED only when the previous session's
// attendance AND logbook are both done. "Attended" itself requires two
// signals to agree (sessionProgress.isAttended AND an attendances row
// exists) — product decision, see plan doc.

export interface SessionProgressLike {
  isAttended?: boolean | null;
  logbook?: boolean | null;
}

export type LogbookProcess = 'approved' | 'process' | 'rejected';

export interface LogbookLike {
  process?: LogbookProcess | null;
}

export interface AttendanceLike {
  id?: string;
  status?: string;
  notes?: string;
}

export interface SessionLike {
  id?: string;
  sessionOrder: number;
  sessionProgress?: SessionProgressLike[] | null;
  logbooks?: LogbookLike[] | null;
  attendances?: AttendanceLike[] | null;
  [key: string]: unknown;
}

export type AttendanceStatus = 'LOCKED' | 'UNLOCKED' | 'COMPLETED';
export type StartLearningStatus =
  | 'LOCKED'
  | 'WAITING_FOR_ATTENDANCE'
  | 'ALLOWED'
  | 'COMPLETED';

function progressOf(
  session: SessionLike | null | undefined,
): SessionProgressLike | null {
  if (!session || !session.sessionProgress || !session.sessionProgress.length)
    return null;
  return session.sessionProgress[0];
}

export function logbookProcessOf(
  session: SessionLike | null | undefined,
): LogbookProcess | null {
  if (!session || !session.logbooks || !session.logbooks.length) return null;
  return session.logbooks[0].process ?? null;
}

export function isAttended(session: SessionLike | null | undefined): boolean {
  const progress = progressOf(session);
  const hasProgressFlag = !!progress && progress.isAttended === true;
  const hasAttendanceRecord = !!(
    session &&
    session.attendances &&
    session.attendances.length
  );
  return hasProgressFlag && hasAttendanceRecord;
}

/**
 * Apakah logbook ikut menentukan terbukanya sesi berikutnya.
 *
 * INI JEBAKAN YANG HARUS DITANGANI LEBIH DULU. Sesi berikutnya baru terbuka
 * bila sesi sebelumnya `isAttended` DAN logbooknya disetujui, dan kolom
 * `session_progresses.logbook` HANYA pernah diisi oleh LogbookService.update
 * saat admin menyetujui sebuah logbook. Artinya: pada program yang logbooknya
 * dimatikan, tidak ada satu pun jalan yang mengisi kolom itu, sehingga sesi
 * kedua dan seterusnya terkunci SELAMANYA. Karena itu syarat ini dilonggarkan
 * lebih dulu, baru antarmuka logbooknya disembunyikan.
 *
 * Sumbernya atribut `data-logbook-required` pada <html>, diisi dari kapabilitas
 * yang dihitung server (courses/program-type.ts). Dibaca setiap kali dipanggil,
 * bukan disimpan: student bisa berpindah program tanpa memuat ulang halaman,
 * dan program berikutnya bisa punya sakelar yang berbeda.
 */
let logbookRequiredOverride: boolean | null = null;

export function setLogbookRequired(value: boolean | null): void {
  logbookRequiredOverride = value;
}

export function isLogbookRequired(): boolean {
  if (logbookRequiredOverride !== null) return logbookRequiredOverride;
  if (typeof document !== 'undefined' && document.documentElement) {
    if (document.documentElement.dataset.logbookRequired === 'false') {
      return false;
    }
  }
  // Default sengaja `true`: halaman yang belum menyebutkan apa pun berperilaku
  // persis seperti sebelum sakelar ini ada.
  return true;
}

export function logbookApproved(
  session: SessionLike | null | undefined,
): boolean {
  if (!isLogbookRequired()) return true;
  const progress = progressOf(session);
  if (progress && progress.logbook === true) return true;
  return logbookProcessOf(session) === 'approved';
}

export function canOpenNextSession(
  session: SessionLike | null | undefined,
): boolean {
  return isAttended(session) && logbookApproved(session);
}

// PRD E3/E4: previous = the session with the largest sessionOrder that is
// still < the target session's sessionOrder, resolved by value rather than
// array index, so gaps or an unsorted `sessions` array can't misidentify it.
export function previousSession(
  sessions: SessionLike[] | null | undefined,
  session: SessionLike | null | undefined,
): SessionLike | null {
  if (
    !Array.isArray(sessions) ||
    !session ||
    typeof session.sessionOrder !== 'number'
  )
    return null;
  let prev: SessionLike | null = null;
  for (const candidate of sessions) {
    if (!candidate || typeof candidate.sessionOrder !== 'number') continue;
    if (candidate.sessionOrder < session.sessionOrder) {
      if (!prev || candidate.sessionOrder > prev.sessionOrder) prev = candidate;
    }
  }
  return prev;
}

export function isSessionUnlocked(
  sessions: SessionLike[] | null | undefined,
  session: SessionLike | null | undefined,
): boolean {
  if (!session) return false;
  const prev = previousSession(sessions, session);
  if (!prev) return true; // no earlier session => this is the first one
  return canOpenNextSession(prev);
}

export function getAttendanceStatus(
  sessions: SessionLike[] | null | undefined,
  session: SessionLike | null | undefined,
): AttendanceStatus {
  if (!isSessionUnlocked(sessions, session)) return 'LOCKED';
  return isAttended(session) ? 'COMPLETED' : 'UNLOCKED';
}

export function getStartLearningStatus(
  sessions: SessionLike[] | null | undefined,
  session: SessionLike | null | undefined,
): StartLearningStatus {
  if (!isSessionUnlocked(sessions, session)) return 'LOCKED';
  if (!isAttended(session)) return 'WAITING_FOR_ATTENDANCE';
  // Tanpa logbook, sesi dianggap tuntas begitu absensinya tercatat - kalau
  // tidak, statusnya berhenti di 'ALLOWED' selamanya dan sesi itu tidak pernah
  // terlihat selesai.
  if (logbookApproved(session)) return 'COMPLETED';
  return 'ALLOWED';
}

export function isWeekQuizUnlocked(
  sessions: SessionLike[] | null | undefined,
): boolean {
  if (!Array.isArray(sessions) || sessions.length === 0) return false;
  return sessions.every((session) => canOpenNextSession(session));
}
