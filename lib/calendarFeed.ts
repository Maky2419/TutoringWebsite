import { sessionInstants, type SessionTime } from "./sessionTime";

export type CalendarFeedSession = SessionTime & {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  updatedAt?: string | Date | null;
};

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function utcStamp(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function foldLine(line: string) {
  const chunks: string[] = [];
  let remaining = line;
  while (Buffer.byteLength(remaining, "utf8") > 73) {
    let cut = Math.min(remaining.length, 73);
    while (cut > 1 && Buffer.byteLength(remaining.slice(0, cut), "utf8") > 73) cut -= 1;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }
  chunks.push(remaining);
  return chunks.join("\r\n ");
}

export function createCalendarFeed(name: string, sessions: CalendarFeedSession[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//K-Cubed Tutoring//Session Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(name)}`,
    "X-WR-CALDESC:K-Cubed tutoring sessions",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const session of sessions) {
    const { start, end } = sessionInstants(session);
    const cancelled = session.status === "cancelled";
    lines.push(
      "BEGIN:VEVENT",
      `UID:session-${session.id}@kcubed.ca`,
      `DTSTAMP:${utcStamp(session.updatedAt ? new Date(session.updatedAt) : new Date())}`,
      `DTSTART:${utcStamp(start)}`,
      `DTEND:${utcStamp(end)}`,
      `SUMMARY:${escapeIcs(session.title)}`,
      `DESCRIPTION:${escapeIcs(session.description || "K-Cubed tutoring session")}`,
      cancelled ? "STATUS:CANCELLED" : "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
