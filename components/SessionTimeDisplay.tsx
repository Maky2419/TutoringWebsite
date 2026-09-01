"use client";
import { DUBAI_TIME_ZONE, formatSessionRange, type SessionTime } from "@/lib/sessionTime";
import { useTimeZone } from "./TimeZoneProvider";

export default function SessionTimeDisplay({ session }: { session: SessionTime }) {
  const { timeZone, ready } = useTimeZone();
  if (!ready) return <span>Loading session time…</span>;
  return <span className="block">
    {timeZone !== DUBAI_TIME_ZONE && <span className="block">{formatSessionRange(session, timeZone)} · {timeZone.replace(/_/g, " ")}</span>}
    <span className="block font-semibold">{formatSessionRange(session)} · Dubai (UTC+4)</span>
  </span>;
}
