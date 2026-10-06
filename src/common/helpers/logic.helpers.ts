export const logicHelpers = {
  eq: (a: unknown, b: unknown) => a == b,
  ne: (a: unknown, b: unknown) => a != b,
  gte: (a: unknown, b: unknown) => Number(a) >= Number(b),
  gt: (a: unknown, b: unknown) => Number(a) > Number(b),
  lte: (a: unknown, b: unknown) => Number(a) <= Number(b),
  lt: (a: unknown, b: unknown) => Number(a) < Number(b),
  or: (...args: any[]) => {
    args.pop();
    return args.some((arg) => {
      if (Array.isArray(arg)) return arg.length > 0;
      if (arg && typeof arg === 'object' && Object.keys(arg).length === 0)
        return false;
      return Boolean(arg);
    });
  },
  not: (value: unknown) => !value,
  coalesce: (...args: any[]) => {
    args.pop();
    for (const a of args) {
      if (Array.isArray(a) && a.length > 0) return a[0];
      if (a !== undefined && a !== null && a !== '' && !Array.isArray(a))
        return a;
    }
    return '';
  },
  isPaidProgram: (
    course:
      | { checkPaid?: boolean | string | null; price?: number | string | null }
      | null
      | undefined,
  ) => {
    if (!course) return false;
    if (course.checkPaid !== undefined && course.checkPaid !== null) {
      return course.checkPaid === true || course.checkPaid === 'true';
    }
    return Boolean(
      course.price !== null &&
      course.price !== undefined &&
      Number(course.price) > 0,
    );
  },
  and: (...args: any[]) => {
    args.pop();
    return args.every((arg) => {
      if (Array.isArray(arg)) return arg.length > 0;
      if (arg && typeof arg === 'object' && Object.keys(arg).length === 0)
        return false;
      return Boolean(arg);
    });
  },
  weekUnlocked: (weekProgresses: { process?: boolean }[]) =>
    !!(
      weekProgresses &&
      weekProgresses.length &&
      weekProgresses[0].process === true
    ),
  isNowBetween: (tanggal: string, waktu_awal: string, waktu_akhir: string) => {
    const now = new Date();
    const start = new Date(`${tanggal}T${waktu_awal}`);
    const end = new Date(`${tanggal}T${waktu_akhir}`);
    return now >= start && now <= end;
  },
  hasUserAbsen: (absenList: { user?: { id?: string } }[], userId: string) => {
    if (!absenList || !Array.isArray(absenList)) {
      return false;
    }
    return absenList.some(
      (attendances) => attendances.user && attendances.user.id === userId,
    );
  },
  ternary: (condition: unknown, ifTrue: unknown, ifFalse: unknown) =>
    condition ? ifTrue : ifFalse,
  roles: (userRole: string, ...roles: string[]) => {
    const allowedRoles = roles.slice(0, -1);
    return allowedRoles.includes(userRole);
  },
  array: (...items: unknown[]) => {
    items.pop();
    return items;
  },
  obj: (...pairs: unknown[]) => {
    pairs.pop();
    const out: Record<string, unknown> = {};
    for (let i = 0; i + 1 < pairs.length; i += 2) {
      out[String(pairs[i])] = pairs[i + 1];
    }
    return out;
  },
  hasRole: (
    user: { role?: string } | null | undefined,
    role: string,
    options: {
      fn: (ctx: unknown) => unknown;
      inverse: (ctx: unknown) => unknown;
    },
  ) => {
    if (user && user.role === role) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  hasAnyRole: (
    user: { role?: string } | null | undefined,
    roles: string[],
    options: {
      fn: (ctx: unknown) => unknown;
      inverse: (ctx: unknown) => unknown;
    },
  ) => {
    if (user && !!user.role && roles.includes(user.role)) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
};

