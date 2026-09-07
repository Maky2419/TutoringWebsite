/** Dubai is the platform/business time zone. Persist instants in UTC. */
export const DUBAI_TIME_ZONE = "Asia/Dubai";
export type SessionTime = {
  lessonDate: string | Date;
  startTime: string;
  endTime: string;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  sourceTimeZone?: string | null;
};
export type SessionTimeInput = {
  lessonDate: string;
  startTime: string;
  endTime: string;
  endDate?: string;
  timeZone: string;
};

export function isTimeZone(value: string): boolean {
  if (!value || /^[+-]/.test(value)) return false;
  try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; }
  catch { return false; }
}

const partFormatters = new Map<string, Intl.DateTimeFormat>();

export function zonedParts(value: Date | string, timeZone = DUBAI_TIME_ZONE) {
  let formatter = partFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    });
    if (partFormatters.size >= 100) partFormatters.clear();
    partFormatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(new Date(value));
  const get = (type: string) => parts.find(p => p.type === type)!.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

function validDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
}

export function addCalendarDays(date: string, days: number) {
  if (!validDate(date)) throw new Error("Choose a valid lesson date.");
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

/** Resolve a wall time using the zone's offsets on either side of DST transitions.
 * Never silently move a nonexistent time or choose an ambiguous occurrence. */
export function wallTimeToInstant(date: string, time: string, timeZone: string): Date {
  if (!isTimeZone(timeZone)) throw new Error("Choose a valid time zone.");
  if (!validDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("Choose a valid date and time.");
  }
  const wall = Date.parse(`${date}T${time}:00Z`);
  const offsets = new Set<number>();
  for (let hours = -36; hours <= 36; hours += 6) {
    const sample = wall + hours * 3600000;
    const p = zonedParts(new Date(sample), timeZone);
    offsets.add(Date.parse(`${p.date}T${p.time}:00Z`) - sample);
  }
  const matches = [...offsets].map(offset => new Date(wall - offset)).filter(candidate => {
    const p = zonedParts(candidate, timeZone);
    return p.date === date && p.time === time;
  });
  if (matches.length === 0) throw new Error("This time does not exist because the clocks change. Choose another time.");
  if (matches.length > 1) throw new Error("This time occurs twice because the clocks change. Select Dubai time and enter the intended Dubai date and time.");
  return matches[0];
}

export function sessionTimeData(input: SessionTimeInput) {
  const startsAt = wallTimeToInstant(input.lessonDate, input.startTime, input.timeZone);
  const endsAt = wallTimeToInstant(input.endDate || input.lessonDate, input.endTime, input.timeZone);
  const durationHours = (endsAt.getTime() - startsAt.getTime()) / 3600000;
  if (durationHours <= 0 || durationHours > 24) throw new Error("End must be after start, and a lesson cannot exceed 24 hours. For an overnight lesson, select the next end date.");
  const dubaiStart = zonedParts(startsAt);
  const dubaiEnd = zonedParts(endsAt);
  return {
    startsAt, endsAt, sourceTimeZone: input.timeZone, durationHours,
    // Keep old fields consistently in Dubai time for compatibility and invoices.
    lessonDate: new Date(`${dubaiStart.date}T00:00:00.000Z`),
    startTime: dubaiStart.time, endTime: dubaiEnd.time,
  };
}

export function sessionInstants(session: SessionTime) {
  if (session.startsAt && session.endsAt) return { start: new Date(session.startsAt), end: new Date(session.endsAt) };
  // Old rows have no zone. Preserve their calendar-date text and interpret as Dubai.
  const date = session.lessonDate instanceof Date ? session.lessonDate.toISOString().slice(0, 10) : session.lessonDate.slice(0, 10);
  const start = wallTimeToInstant(date, session.startTime, DUBAI_TIME_ZONE);
  const endDate = session.endTime <= session.startTime ? addCalendarDays(date, 1) : date;
  const end = wallTimeToInstant(endDate, session.endTime, DUBAI_TIME_ZONE);
  return { start, end };
}

export function sessionDateKey(session: SessionTime, timeZone = DUBAI_TIME_ZONE) {
  return zonedParts(sessionInstants(session).start, timeZone).date;
}

export function formatSessionRange(session: SessionTime, timeZone = DUBAI_TIME_ZONE) {
  const { start, end } = sessionInstants(session);
  const format = (date: Date) => new Intl.DateTimeFormat("en-GB", {
    timeZone, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(date);
  const endText = zonedParts(start, timeZone).date === zonedParts(end, timeZone).date
    ? zonedParts(end, timeZone).time : format(end);
  return `${format(start)} – ${endText}`;
}

/** Compact time-only range for calendar event chips. */
export function formatSessionTimeRange(session: SessionTime, timeZone = DUBAI_TIME_ZONE) {
  const { start, end } = sessionInstants(session);
  const first = zonedParts(start, timeZone);
  const last = zonedParts(end, timeZone);
  const endText = first.date === last.date ? last.time : `${last.date} ${last.time}`;
  return `${first.time} – ${endText}`;
}
