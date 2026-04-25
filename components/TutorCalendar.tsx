"use client";

import { useMemo, useState } from "react";

type CalendarSession = {
  id: number;
  lessonDate: string;
  startTime: string;
  endTime: string;
  studentName: string | null;
  studentEmail: string | null;
  amount: number;
};

export default function TutorCalendar({
  sessions,
}: {
  sessions: CalendarSession[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
      const d = new Date(session.lessonDate);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          Previous
        </button>

        <h3 className="text-lg font-semibold text-white">{monthName}</h3>

        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-white/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const daySessions = day ? getSessionsForDay(day) : [];

          return (
            <div
              key={index}
              className="min-h-28 rounded-2xl border border-white/10 bg-black/20 p-3"
            >
              {day && (
                <>
                  <p className="mb-2 text-sm font-semibold text-white">{day}</p>

                  <div className="space-y-2">
                    {daySessions.slice(0, 2).map((session) => (
                      <div
                        key={session.id}
                        className="rounded-xl bg-emerald-500/10 p-2 text-left"
                      >
                        <p className="text-xs font-semibold text-emerald-200">
                          {session.startTime} - {session.endTime}
                        </p>
                        <p className="text-xs text-white/70">
                          {session.studentName || "Student"}
                        </p>
                      </div>
                    ))}

                    {daySessions.length > 2 && (
                      <p className="text-xs text-white/50">
                        +{daySessions.length - 2} more
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}