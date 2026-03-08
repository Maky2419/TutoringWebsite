"use client";

import { useEffect, useState } from "react";

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

function formatMoney(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

function formatDateOnly(value: string) {
  return new Date(value).toISOString().split("T")[0];
}

export default function StudentScheduleView() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/student/sessions");
    const data = await res.json();
    setAssignments(data.assignments || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <p className="text-sm text-white/60">Loading schedule...</p>;
  }

  if (assignments.length === 0) {
    return <p className="text-sm text-white/60">No tutor schedule yet.</p>;
  }

  return (
    <div className="space-y-6">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {assignment.tutor.name}
              </h3>
              <p className="text-sm text-white/60">{assignment.tutor.email}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-white/60">Accumulated total</p>
              <p className="text-2xl font-bold text-emerald-300">
                {formatMoney(assignment.accumulatedTotal)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {assignment.sessions.length === 0 ? (
              <p className="text-sm text-white/60">No sessions scheduled yet.</p>
            ) : (
              assignment.sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="font-medium text-white">
                    {formatDateOnly(session.lessonDate)}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {session.startTime} - {session.endTime}
                  </p>
                  <p className="mt-1 text-sm text-emerald-300">
                    {formatMoney(session.amount)}
                  </p>
                  {session.notes && (
                    <p className="mt-2 text-sm text-white/60">{session.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}