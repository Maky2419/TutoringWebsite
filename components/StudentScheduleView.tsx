"use client";

import { useEffect, useMemo, useState } from "react";

type SessionRow = {
  id: number;
  lessonDate: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  amount: string | number;
};

type AssignmentRow = {
  id: number;
  accumulatedTotal: string | number;
  tutor: {
    id: number;
    name: string;
    email: string;
    hourlyRate: number;
  };
  sessions: SessionRow[];
};

type CalendarSession = SessionRow & {
  tutorName: string;
  tutorEmail: string;
  accumulatedTotal: string | number;
};

function formatMoney(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

function toLocalDateKey(dateValue: string | Date) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatReadableDate(dateValue: string | Date) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function buildCalendarDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();

  const firstVisibleDay = new Date(year, month, 1 - startDay);
  const days: Date[] = [];

  for (let i = 0; i < 42; i += 1) {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + i);
    days.push(day);
  }

  return days;
}

function isSameDay(a: Date | string, b: Date | string) {
  return toLocalDateKey(a) === toLocalDateKey(b);
}

export default function StudentScheduleView() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/student/sessions");
      const data = await res.json();
      setAssignments(data.assignments || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const allSessions = useMemo<CalendarSession[]>(() => {
    return assignments.flatMap((assignment) =>
      assignment.sessions.map((session) => ({
        ...session,
        tutorName: assignment.tutor.name,
        tutorEmail: assignment.tutor.email,
        accumulatedTotal: assignment.accumulatedTotal,
      }))
    );
  }, [assignments]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();

    for (const session of allSessions) {
      const key = toLocalDateKey(session.lessonDate);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(session);
    }

    for (const [, sessions] of map) {
      sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
  }, [allSessions]);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const selectedSessions = sessionsByDate.get(selectedDate) || [];

  const upcomingSessions = useMemo(() => {
    const now = new Date();

    return [...allSessions]
      .filter((session) => {
        const sessionDate = new Date(session.lessonDate);
        return sessionDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
      })
      .sort(
        (a, b) =>
          new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime() ||
          a.startTime.localeCompare(b.startTime)
      )
      .slice(0, 8);
  }, [allSessions]);

  if (loading) {
    return <p className="text-sm text-white/60">Loading schedule...</p>;
  }

  if (assignments.length === 0) {
    return <p className="text-sm text-white/60">No tutor schedule yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
              )
            }
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            ← Prev
          </button>

          <h3 className="text-center text-2xl font-semibold text-white">
            {getMonthLabel(currentMonth)}
          </h3>

          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
              )
            }
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Next →
          </button>
        </div>

        <div className="mb-3 grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-wide text-white/45">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {calendarDays.map((day) => {
            const dateKey = toLocalDateKey(day);
            const daySessions = sessionsByDate.get(dateKey) || [];
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(dateKey)}
                className={[
                  "min-h-[130px] rounded-2xl border p-3 text-left transition",
                  isSelected
                    ? "border-indigo-400 bg-indigo-500/20"
                    : "border-white/10 bg-black/20 hover:bg-white/10",
                  !isCurrentMonth ? "opacity-40" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                      isToday ? "bg-white text-slate-900" : "text-white",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </span>

                  {daySessions.length > 0 && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-300">
                      {daySessions.length}
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {daySessions.slice(0, 2).map((session) => (
                    <div
                      key={session.id}
                      className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200"
                    >
                      <div className="truncate font-medium">{session.tutorName}</div>
                      <div className="truncate text-emerald-300/80">
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                  ))}

                  {daySessions.length > 2 && (
                    <div className="text-[11px] text-white/50">
                      +{daySessions.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Selected day</h3>
          <p className="mt-1 text-sm text-white/55">
            {formatReadableDate(selectedDate)}
          </p>

          <div className="mt-4 space-y-3">
            {selectedSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-white/60">
                No sessions scheduled for this day.
              </div>
            ) : (
              selectedSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{session.tutorName}</p>
                      <p className="text-sm text-white/55">{session.tutorEmail}</p>
                    </div>

                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                      {formatMoney(session.amount)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-white/75">
                    {session.startTime} - {session.endTime}
                  </p>

                  {session.notes && (
                    <p className="mt-2 text-sm text-white/55">{session.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Upcoming sessions</h3>
          <p className="mt-1 text-sm text-white/55">
            Your next scheduled lessons in calendar order
          </p>

          <div className="mt-4 space-y-3">
            {upcomingSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-white/60">
                No upcoming sessions yet.
              </div>
            ) : (
              upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-white">{session.tutorName}</p>
                      <p className="mt-1 text-sm text-white/60">
                        {formatReadableDate(session.lessonDate)}
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        {session.startTime} - {session.endTime}
                      </p>
                    </div>

                    <p className="text-sm text-emerald-300">
                      {formatMoney(session.amount)}
                    </p>
                  </div>

                  {session.notes && (
                    <p className="mt-2 text-sm text-white/55">{session.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}