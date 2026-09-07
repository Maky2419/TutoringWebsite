"use client";

import StudentCancellationButton from "./StudentCancellationButton";
import type { CancellationInfo } from "@/lib/cancellationShared";
import SessionTimeDisplay from "./SessionTimeDisplay";
import { useTimeZone } from "./TimeZoneProvider";
import { formatSessionTimeRange, sessionDateKey, sessionInstants, zonedParts } from "@/lib/sessionTime";
import { useEffect, useMemo, useState } from "react";
import { Money } from "@/components/CurrencyProvider";

type StudentSession = CancellationInfo & {
  id: number;
  lessonDate: string | Date;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  sourceTimeZone?: string | null;
  startTime: string;
  endTime: string;
  tutorName: string;
  tutorEmail?: string;
  notes?: string | null;
  amount: string | number;
  status?: string;
};

export default function StudentScheduleView({
  sessions,
}: {
  sessions: StudentSession[];
}) {
  const { timeZone, ready } = useTimeZone();
  const [currentDate, setCurrentDate] = useState(new Date(2000, 0, 1));
  const [selectedSession, setSelectedSession] = useState<StudentSession | null>(null);
  useEffect(() => {
    const [y, m] = zonedParts(new Date(), timeZone).date.split("-").map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
  }, [timeZone]);

  const activeSessions = sessions
    .filter((session) => session.status !== "cancelled")
    .sort(
      (a, b) =>
        sessionInstants(a).start.getTime() - sessionInstants(b).start.getTime()
    );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return [
      ...Array(firstDay.getDay()).fill(null),
      ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
    ];
  }, [year, month]);

  function sessionsForDay(day: number) {
    return activeSessions.filter((session) => {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return sessionDateKey(session, timeZone) === key;
    });
  }

  if (!ready) return <p>Detecting your time zone…</p>;

  return (
    <div className="space-y-8">
      {/* SESSION CARDS */}
      <div className="space-y-3">
        {activeSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-slate-600">
            No confirmed sessions yet.
          </div>
        ) : (
          activeSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-slate-950">
                    {session.tutorName}
                  </p>

                  <p className="mt-2 text-lg text-slate-600">
                    <SessionTimeDisplay session={session} />
                  </p>

                  <p className="mt-3 text-3xl font-extrabold text-green-600">
                    <Money amountUSD={session.amount} />
                  </p>
                </div>

                <StudentCancellationButton session={session} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* CALENDAR */}
      <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Previous
          </button>

          <h3 className="text-xl font-extrabold text-slate-950">
            {monthName}
          </h3>

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
          {days.map((day, index) => {
            const daySessions = day ? sessionsForDay(day) : [];

            return (
              <div
                key={index}
                className={`min-h-28 rounded-2xl border p-2 ${
                  day
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-100 bg-white"
                }`}
              >
                {day && (
                  <>
                    <p className="mb-2 text-sm font-bold text-slate-700">
                      {day}
                    </p>

                    <div className="space-y-1">
                      {daySessions.map((session) => (
                        <button
                          type="button"
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className="w-full rounded-lg border border-green-300 bg-green-600 p-2 text-left shadow-sm transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <p className="text-[11px] font-semibold leading-4 text-white">
                            <span className="font-extrabold">{session.tutorName}</span>{" "}
                            {formatSessionTimeRange(session)} · Dubai (UTC+4)
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedSession(null);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="student-calendar-dialog-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Session details</p>
                <h4 id="student-calendar-dialog-title" className="mt-1 text-2xl font-extrabold text-slate-950">{selectedSession.tutorName}</h4>
                {selectedSession.tutorEmail && <p className="text-sm text-slate-500">{selectedSession.tutorEmail}</p>}
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
