"use client";

import { useMemo, useState } from "react";

type StudentSession = {
  id: number;
  lessonDate: string | Date;
  startTime: string;
  endTime: string;
  tutorName: string;
  amount: string | number;
  status?: string;
};

function formatMoney(value: number | string) {
  return `$${Number(value || 0).toFixed(2)} USD`;
}

export default function StudentScheduleView({
  sessions,
}: {
  sessions: StudentSession[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const activeSessions = sessions
    .filter((session) => session.status !== "cancelled")
    .sort(
      (a, b) =>
        new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
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
      const d = new Date(session.lessonDate);

      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  }

  async function cancelSession(sessionId: number) {
    const confirmed = confirm("Are you sure you want to cancel this session?");
    if (!confirmed) return;

    const res = await fetch(`/api/student/sessions/${sessionId}`, {
      method: "PATCH",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to cancel session.");
      return;
    }

    window.location.reload();
  }

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
                    {new Date(session.lessonDate).toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}{" "}
                    · {session.startTime} - {session.endTime}
                  </p>

                  <p className="mt-3 text-3xl font-extrabold text-green-600">
                    {formatMoney(session.amount)}
                  </p>
                </div>

                <button
                  onClick={() => cancelSession(session.id)}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  Cancel Session
                </button>
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
                        <div
                          key={session.id}
                          className="rounded-lg border border-green-300 bg-green-500 p-2 shadow-sm"
                        >
                          <p className="truncate text-[11px] font-extrabold text-white">
                            {session.tutorName}
                          </p>

                          <p className="text-[10px] font-semibold text-white/90">
                            {session.startTime} - {session.endTime}
                          </p>

                          <p className="mt-1 text-[10px] font-bold text-white">
                            {formatMoney(session.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}