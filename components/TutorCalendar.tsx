"use client";

import SessionTimeDisplay from "./SessionTimeDisplay";
import { useTimeZone } from "./TimeZoneProvider";
import { formatSessionTimeRange, sessionDateKey, zonedParts } from "@/lib/sessionTime";
import { useEffect, useMemo, useState } from "react";
import { Money } from "@/components/CurrencyProvider";

type CalendarSession = {
  id: number;
  lessonDate: string;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  sourceTimeZone?: string | null;
  startTime: string;
  endTime: string;
  studentId?: string;
  studentName: string | null;
  studentEmail: string | null;
  notes?: string | null;
  durationHours?: number;
  amount: number;
  status?: string;
};

function studentColor(session: CalendarSession) {
  const key = session.studentId || session.studentEmail || session.studentName || String(session.id);
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = key.charCodeAt(index) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 68% 42%)`;
}

export default function TutorCalendar({
  sessions,
}: {
  sessions: CalendarSession[];
}) {
  const { timeZone, ready } = useTimeZone();
  const [currentDate, setCurrentDate] = useState(new Date(2000, 0, 1));
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  useEffect(() => {
    const [y, m] = zonedParts(new Date(), timeZone).date.split("-").map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
  }, [timeZone]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayKey = zonedParts(new Date(), timeZone).date;

  const monthName = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    return [
      ...Array(startPadding).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [year, month]);

  function getSessionsForDay(day: number) {
    return sessions.filter((session) => {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return sessionDateKey(session, timeZone) === key;
    });
  }

  if (!ready) return <p>Detecting your time zone…</p>;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          Previous
        </button>

        <h3 className="text-lg font-extrabold text-slate-950">{monthName}</h3>

        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const daySessions = day ? getSessionsForDay(day) : [];
          const dateKey = day
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";
          const isToday = dateKey === todayKey;

          return (
            <div
              key={index}
              className={`min-h-28 rounded-2xl border p-3 ${
                isToday
                  ? "border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-300"
                  : day
                  ? "border-slate-200 bg-white"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              {day && (
                <>
                  <div className="mb-2 flex items-center justify-between gap-1">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {daySessions.map((session) => {
                      const isCancelled = session.status === "cancelled";

                      return (
                        <button
                          type="button"
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          style={{ backgroundColor: studentColor(session) }}
                          className={`w-full rounded-xl p-2 text-left text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isCancelled ? "opacity-60" : ""}`}
                        >
                          <p className="text-[11px] font-semibold leading-4 text-white">
                            <span className="font-extrabold">{session.studentName || "Student"}</span>{" "}
                            {formatSessionTimeRange(session)} · Dubai (UTC+4)
                          </p>

                          {isCancelled && (
                            <p className="mt-1 text-[11px] font-bold text-white">
                              Cancelled
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedSession(null);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="tutor-calendar-dialog-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Session details</p>
                <h4 id="tutor-calendar-dialog-title" className="mt-1 text-2xl font-extrabold text-slate-950">
                  {selectedSession.studentName || "Student"}
                </h4>
                <p className="text-sm text-slate-500">{selectedSession.studentEmail || "No email available"}</p>
              </div>
              <button type="button" onClick={() => setSelectedSession(null)} aria-label="Close session details" className="rounded-full bg-slate-100 px-3 py-1.5 text-lg font-bold text-slate-700 hover:bg-slate-200">×</button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-blue-50 p-4 text-sm text-slate-800">
                <SessionTimeDisplay session={selectedSession} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 p-4">
                  <p className="text-xs font-semibold text-slate-500">Amount</p>
                  <p className="mt-1 text-xl font-extrabold text-green-700"><Money amountUSD={selectedSession.amount} /></p>
                </div>
                <div className="rounded-2xl border border-blue-100 p-4">
                  <p className="text-xs font-semibold text-slate-500">Status</p>
                  <p className="mt-1 text-xl font-extrabold capitalize text-slate-950">{selectedSession.status || "scheduled"}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 p-4">
                <p className="text-xs font-semibold text-slate-500">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{selectedSession.notes || "No notes for this session."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
