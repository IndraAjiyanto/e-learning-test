import {
  isAttended,
  logbookApproved,
  logbookProcessOf,
  canOpenNextSession,
  previousSession,
  isSessionUnlocked,
  getAttendanceStatus,
  getStartLearningStatus,
  isWeekQuizUnlocked,
  SessionLike,
  LogbookProcess,
} from './sessionUnlock';

interface SessionOpts {
  attended?: boolean;
  attendanceRow?: boolean; // defaults to `attended` — override to test the AND-decision independently
  logbook?: boolean;
  logbookProcess?: LogbookProcess | null;
  noProgress?: boolean;
}

function makeSession(
  sessionOrder: number,
  opts: SessionOpts = {},
): SessionLike {
  const {
    attended = false,
    attendanceRow = attended,
    logbook = false,
    logbookProcess = null,
    noProgress = false,
  } = opts;
  return {
    id: sessionOrder,
    sessionOrder,
    sessionProgress: noProgress ? [] : [{ isAttended: attended, logbook }],
    logbooks: logbookProcess ? [{ process: logbookProcess }] : [],
    attendances: attendanceRow
      ? [{ id: sessionOrder, status: 'present', notes: '' }]
      : [],
  };
}

// "isAttendance=true, logbook=true" per the PRD's test matrix means both
// signals for attendance agree AND logbook is approved.
function done(sessionOrder: number): SessionLike {
  return makeSession(sessionOrder, { attended: true, logbook: true });
}
function attendedOnly(sessionOrder: number): SessionLike {
  return makeSession(sessionOrder, { attended: true, logbook: false });
}
function untouched(sessionOrder: number): SessionLike {
  return makeSession(sessionOrder, { attended: false, logbook: false });
}

describe('sessionUnlock — PRD §12 acceptance matrix', () => {
  test('T1: S1 untouched, S2 untouched → S1 UNLOCKED/UNLOCKED/WAITING_FOR_ATTENDANCE, S2 & S3 LOCKED', () => {
    const s1 = untouched(1);
    const s2 = untouched(2);
    const s3 = untouched(3);
    const sessions = [s1, s2, s3];

    expect(isSessionUnlocked(sessions, s1)).toBe(true);
    expect(getAttendanceStatus(sessions, s1)).toBe('UNLOCKED');
    expect(getStartLearningStatus(sessions, s1)).toBe('WAITING_FOR_ATTENDANCE');

    expect(isSessionUnlocked(sessions, s2)).toBe(false);
    expect(getAttendanceStatus(sessions, s2)).toBe('LOCKED');
    expect(getStartLearningStatus(sessions, s2)).toBe('LOCKED');

    expect(isSessionUnlocked(sessions, s3)).toBe(false);
    expect(getAttendanceStatus(sessions, s3)).toBe('LOCKED');
    expect(getStartLearningStatus(sessions, s3)).toBe('LOCKED');
  });

  test('T2: S1 attended only, S2 untouched → S1 COMPLETED/ALLOWED, S2 & S3 LOCKED', () => {
    const s1 = attendedOnly(1);
    const s2 = untouched(2);
    const s3 = untouched(3);
    const sessions = [s1, s2, s3];

    expect(getAttendanceStatus(sessions, s1)).toBe('COMPLETED');
    expect(getStartLearningStatus(sessions, s1)).toBe('ALLOWED');
    expect(isSessionUnlocked(sessions, s2)).toBe(false);
    expect(isSessionUnlocked(sessions, s3)).toBe(false);
  });

  test('T3: S1 done, S2 untouched → S1 COMPLETED/COMPLETED, S2 UNLOCKED/UNLOCKED/WAITING_FOR_ATTENDANCE, S3 LOCKED', () => {
    const s1 = done(1);
    const s2 = untouched(2);
    const s3 = untouched(3);
    const sessions = [s1, s2, s3];

    expect(getAttendanceStatus(sessions, s1)).toBe('COMPLETED');
    expect(getStartLearningStatus(sessions, s1)).toBe('COMPLETED');

    expect(isSessionUnlocked(sessions, s2)).toBe(true);
    expect(getAttendanceStatus(sessions, s2)).toBe('UNLOCKED');
    expect(getStartLearningStatus(sessions, s2)).toBe('WAITING_FOR_ATTENDANCE');

    expect(isSessionUnlocked(sessions, s3)).toBe(false);
    expect(getAttendanceStatus(sessions, s3)).toBe('LOCKED');
  });

  test('T4: S1 done, S2 attended only → S2 COMPLETED/ALLOWED, S3 LOCKED', () => {
    const s1 = done(1);
    const s2 = attendedOnly(2);
    const s3 = untouched(3);
    const sessions = [s1, s2, s3];

    expect(getAttendanceStatus(sessions, s2)).toBe('COMPLETED');
    expect(getStartLearningStatus(sessions, s2)).toBe('ALLOWED');
    expect(isSessionUnlocked(sessions, s3)).toBe(false);
  });

  test('T5: S1 & S2 done → S3 UNLOCKED/UNLOCKED/WAITING_FOR_ATTENDANCE', () => {
    const s1 = done(1);
    const s2 = done(2);
    const s3 = untouched(3);
    const sessions = [s1, s2, s3];

    expect(getAttendanceStatus(sessions, s2)).toBe('COMPLETED');
    expect(getStartLearningStatus(sessions, s2)).toBe('COMPLETED');

    expect(isSessionUnlocked(sessions, s3)).toBe(true);
    expect(getAttendanceStatus(sessions, s3)).toBe('UNLOCKED');
    expect(getStartLearningStatus(sessions, s3)).toBe('WAITING_FOR_ATTENDANCE');
  });

  test('T6: S1 anomalous data (logbook true but never attended) → S2 stays LOCKED', () => {
    const s1 = makeSession(1, { attended: false, logbook: true });
    const s2 = untouched(2);
    const sessions = [s1, s2];

    expect(canOpenNextSession(s1)).toBe(false);
    expect(isSessionUnlocked(sessions, s2)).toBe(false);
    expect(getAttendanceStatus(sessions, s2)).toBe('LOCKED');
    expect(getStartLearningStatus(sessions, s2)).toBe('LOCKED');
  });

  test('T7: previous session has no progress data at all → treated as false/false, next session LOCKED (except session 1)', () => {
    const s1 = makeSession(1, { noProgress: true });
    const s2 = makeSession(2, { noProgress: true });
    const sessions = [s1, s2];

    expect(isSessionUnlocked(sessions, s1)).toBe(true);
    expect(isSessionUnlocked(sessions, s2)).toBe(false);
    expect(getAttendanceStatus(sessions, s2)).toBe('LOCKED');
  });

  test('T8: legacy is_unlocked:true field on the raw payload is ignored — helper still says LOCKED', () => {
    const s1 = untouched(1);
    const s2 = { ...untouched(2), is_unlocked: true, can_attend: true };
    const sessions = [s1, s2];

    expect(isSessionUnlocked(sessions, s2)).toBe(false);
    expect(getAttendanceStatus(sessions, s2)).toBe('LOCKED');
    expect(getStartLearningStatus(sessions, s2)).toBe('LOCKED');
  });

  // T9 (route guard against direct URL access to a locked session) is not
  // applicable at this pure-function layer — see plan doc "Explicitly out
  // of scope": there is no per-session route in this app to guard.

  test('T10: after S1 logbook gets approved and data is refetched, S2 flips to UNLOCKED', () => {
    const before = [attendedOnly(1), untouched(2)];
    expect(isSessionUnlocked(before, before[1])).toBe(false);

    const after = [done(1), untouched(2)];
    expect(isSessionUnlocked(after, after[1])).toBe(true);
    expect(getAttendanceStatus(after, after[1])).toBe('UNLOCKED');
  });
});

describe('sessionUnlock — invariant (PRD §5.4)', () => {
  test('LOCKED session always implies LOCKED attendance and LOCKED start-learning status', () => {
    const fixtures: SessionLike[][] = [
      [untouched(1), untouched(2), untouched(3)],
      [attendedOnly(1), untouched(2), untouched(3)],
      [done(1), attendedOnly(2), untouched(3)],
      [
        makeSession(1, { noProgress: true }),
        makeSession(2, { noProgress: true }),
      ],
    ];

    for (const sessions of fixtures) {
      for (const session of sessions) {
        if (!isSessionUnlocked(sessions, session)) {
          expect(getAttendanceStatus(sessions, session)).toBe('LOCKED');
          expect(getStartLearningStatus(sessions, session)).toBe('LOCKED');
        }
      }
    }
  });
});

describe('sessionUnlock — AND decision for isAttended', () => {
  test('sessionProgress.isAttended=true but no attendances row => not attended', () => {
    const session = makeSession(1, { attended: true, attendanceRow: false });
    expect(isAttended(session)).toBe(false);
  });

  test('attendances row exists but sessionProgress.isAttended=false => not attended', () => {
    const session = makeSession(1, { attended: false, attendanceRow: true });
    expect(isAttended(session)).toBe(false);
  });

  test('both signals true => attended', () => {
    const session = makeSession(1, { attended: true, attendanceRow: true });
    expect(isAttended(session)).toBe(true);
  });
});

describe('sessionUnlock — edge cases (PRD §10)', () => {
  test('E1: previous session PRESENT but its progress sub-objects are empty => treated as false/false, next LOCKED', () => {
    // This is the literal E1 row: the session exists in the response, but
    // has no sessionProgress/attendances entries yet. (Distinct from the
    // session being entirely absent from the array — see the E3 case below,
    // where an absent predecessor is resolved via the sessionOrder-gap rule
    // instead and is NOT the same scenario as E1.)
    const s2 = makeSession(2, { noProgress: true });
    const s3 = untouched(3);
    const sessions = [s2, s3];
    expect(isSessionUnlocked(sessions, s3)).toBe(false);
    expect(getAttendanceStatus(sessions, s3)).toBe('LOCKED');
  });

  test('E2: null/undefined isAttended and logbook are treated as false', () => {
    const session: SessionLike = {
      id: 1,
      sessionOrder: 1,
      sessionProgress: [{ isAttended: null, logbook: undefined }],
      logbooks: [],
      attendances: null,
    };
    expect(isAttended(session)).toBe(false);
    expect(logbookApproved(session)).toBe(false);
  });

  test('E3: non-sequential sessionOrder — previous = largest sessionOrder below target, not array index', () => {
    const s1 = done(1);
    const s5 = done(5); // gap between 1 and 5
    const s10 = untouched(10);
    const sessions = [s1, s5, s10];

    expect(previousSession(sessions, s10)?.sessionOrder).toBe(5);
    expect(isSessionUnlocked(sessions, s10)).toBe(true);
  });

  test('E4: sessions array out of order — result is independent of array order', () => {
    const s1 = done(1);
    const s2 = untouched(2);
    const sessions = [s2, s1]; // reversed
    expect(isSessionUnlocked(sessions, s2)).toBe(true);
  });

  test('E6: mentor rejects logbook — logbook stays not-approved, next session stays LOCKED', () => {
    const s1 = makeSession(1, {
      attended: true,
      logbook: false,
      logbookProcess: 'rejected',
    });
    const s2 = untouched(2);
    const sessions = [s1, s2];

    expect(logbookApproved(s1)).toBe(false);
    expect(isSessionUnlocked(sessions, s2)).toBe(false);
  });

  test('logbookProcessOf reads the first logbook entry, null when absent', () => {
    expect(logbookProcessOf(untouched(1))).toBeNull();
    expect(
      logbookProcessOf(makeSession(1, { logbookProcess: 'process' })),
    ).toBe('process');
  });

  test('isWeekQuizUnlocked requires every session in the week to be fully done', () => {
    expect(isWeekQuizUnlocked([])).toBe(false);
    expect(isWeekQuizUnlocked([done(1), attendedOnly(2)])).toBe(false);
    expect(isWeekQuizUnlocked([done(1), done(2)])).toBe(true);
  });
});
