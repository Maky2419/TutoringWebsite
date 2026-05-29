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
  status?: string;
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

          return (
            <div
              key={index}
              className={`min-h-28 rounded-2xl border p-3 ${
                day
                  ? "border-slate-200 bg-white"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              {day && (
                <>
                  <p className="mb-2 text-sm font-bold text-slate-700">{day}</p>

                  <div className="space-y-2">
                    {daySessions.slice(0, 2).map((session) => {
                      const isCancelled = session.status === "cancelled";

                      return (
                        <div
                          key={session.id}
                          className={`rounded-xl p-2 text-left shadow-sm ${
                            isCancelled
                              ? "bg-red-500 text-white"
                              : "bg-emerald-500 text-white"
                          }`}
                        >
                          <p className="text-xs font-extrabold text-white">
                            {session.startTime} - {session.endTime}
                          </p>

                          <p className="truncate text-xs font-medium text-white/90">
                            {session.studentName || "Student"}
                          </p>

                          {isCancelled && (
                            <p className="mt-1 text-[11px] font-bold text-white">
                              Cancelled
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {daySessions.length > 2 && (
                      <p className="text-xs font-semibold text-slate-500">
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