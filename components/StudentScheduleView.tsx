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
  return `AED ${Number(value || 0).toFixed(2)}`;
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
        new Date(a.lessonDate).getTime() -
        new Date(b.lessonDate).getTime()
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
    const confirmed = confirm(
      "Are you sure you want to cancel this session?"
    );

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
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
            No confirmed sessions yet.
          </div>
        ) : (
          activeSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-2xl font-semibold text-white">
                    {session.tutorName}
                  </p>

                  <p className="mt-2 text-lg text-white/60">
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

                  <p className="mt-3 text-3xl font-semibold text-emerald-300">
                    {formatMoney(session.amount)}
                  </p>
                </div>

                <button
                  onClick={() => cancelSession(session.id)}
                  className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
                >
                  Cancel session
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CALENDAR */}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentDate(new Date(year, month - 1, 1))
            }
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Previous
          </button>

          <h3 className="text-xl font-bold text-white">
            {monthName}
          </h3>

          <button
            onClick={() =>
              setCurrentDate(new Date(year, month + 1, 1))
            }
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-white/45">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => (
              <div key={day}>{day}</div>
            )
          )}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const daySessions = day ? sessionsForDay(day) : [];

            return (
              <div
                key={index}
                className="min-h-28 rounded-2xl border border-white/10 bg-black/20 p-2"
              >
                {day && (
                  <>
                    <p className="mb-2 text-sm font-semibold text-white">
                      {day}
                    </p>

                    <div className="space-y-1">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          className="rounded-lg bg-emerald-500/10 p-2"
                        >
                          <p className="truncate text-[10px] font-semibold text-emerald-200">
                            {session.tutorName}
                          </p>

                          <p className="text-[10px] text-white/60">
                            {session.startTime} - {session.endTime}
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