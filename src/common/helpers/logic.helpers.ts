export const logicHelpers = {
  eq: (a: any, b: any) => a == b,
  gte: (a: number, b: number) => a >= b,
  gt: (a: number, b: number) => a > b,
  or: (...args: any[]) => {
    args.pop();
    return args.some(Boolean);
  },
  and: (...args: any[]) => {
    args.pop();
    return args.every(Boolean);
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
  hasUserAbsen: (absenList: any[], userId: string) => {
    if (!absenList || !Array.isArray(absenList)) {
      return false;
    }
    return absenList.some(
      (attendances) => attendances.user && attendances.user.id === userId,
    );
  },
  ternary: (condition: any, ifTrue: any, ifFalse: any) =>
    condition ? ifTrue : ifFalse,
  roles: (userRole: string, ...roles: string[]) => {
    const allowedRoles = roles.slice(0, -1);
    return allowedRoles.includes(userRole);
  },
  array: (...items: any[]) => {
    items.pop();
    return items;
  },
  obj: (...pairs: any[]) => {
    pairs.pop();
    const out: Record<string, any> = {};
    for (let i = 0; i + 1 < pairs.length; i += 2) {
      out[String(pairs[i])] = pairs[i + 1];
    }
    return out;
  },
  hasRole: (user: any, role: string, options: any) => {
    if (user && user.role === role) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  hasAnyRole: (user: any, roles: string[], options: any) => {
    if (user && roles.includes(user.role)) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
};
