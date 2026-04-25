"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Student = {
  id: string;
  name: string | null;
  email: string | null;
};

type AssignedStudent = {
  id: number;
  studentId: string;
  student: Student;
};

type TeachingSession = {
  id: number;
  lessonDate: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  durationHours: string | number;
  amount: string | number;
};

type AssignmentResponse = {
  assignment: {
    id: number;
    accumulatedTotal: string | number;
    student: Student;
    sessions: TeachingSession[];
  };
  hourlyRate: number;
};

function money(value: string | number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function prettyDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function inputDate(value: string) {
  return new Date(value).toISOString().split("T")[0];
}

export default function TutorScheduleManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assigned, setAssigned] = useState<AssignedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [scheduleData, setScheduleData] = useState<AssignmentResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sessionId: "",
    lessonDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  const selectedStudent = useMemo(() => {
    return (
      assigned.find((item) => item.studentId === selectedStudentId)?.student ||
      students.find((student) => student.id === selectedStudentId) ||
      null
    );
  }, [assigned, students, selectedStudentId]);

  const sessions = scheduleData?.assignment.sessions || [];

  async function loadStudents() {
    const res = await fetch("/api/tutor/students");
    const data = await res.json();
    setStudents(data.students || []);
    setAssigned(data.assignedStudents || []);
  }

  async function loadSchedule(studentId: string) {
    if (!studentId) {
      setScheduleData(null);
      return;
    }

    const res = await fetch(`/api/tutor/sessions?studentId=${studentId}`);
    const data = await res.json();
    setScheduleData(res.ok ? data : null);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      await loadStudents();
      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    loadSchedule(selectedStudentId);
  }, [selectedStudentId]);

  async function assignStudent() {
    if (!selectedStudentId) return;

    setSaving(true);

    await fetch("/api/tutor/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ studentId: selectedStudentId }),
    });

    await loadStudents();
    await loadSchedule(selectedStudentId);

    setSaving(false);
  }

  async function saveSession(e: FormEvent) {
    e.preventDefault();

    if (!selectedStudentId) return;

    setSaving(true);

    const isEditing = Boolean(form.sessionId);

    await fetch("/api/tutor/sessions", {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId: selectedStudentId,
        sessionId: form.sessionId ? Number(form.sessionId) : undefined,
        lessonDate: form.lessonDate,
        startTime: form.startTime,
        endTime: form.endTime,
        notes: form.notes,
      }),
    });

    setForm({
      sessionId: "",
      lessonDate: "",
      startTime: "",
      endTime: "",
      notes: "",
    });

    await loadSchedule(selectedStudentId);
    setSaving(false);
  }

  function editSession(session: TeachingSession) {
    setForm({
      sessionId: String(session.id),
      lessonDate: inputDate(session.lessonDate),
      startTime: session.startTime,
      endTime: session.endTime,
      notes: session.notes || "",
    });
  }

  async function deleteSession(sessionId: number) {
    await fetch("/api/tutor/sessions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    await loadSchedule(selectedStudentId);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Schedule Manager</h2>
          <p className="mt-1 text-sm text-white/50">
            Assign students and manage lessons.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
          <p className="text-xs text-emerald-100/60">Current total</p>
          <p className="text-2xl font-black text-emerald-300">
            {scheduleData
              ? money(scheduleData.assignment.accumulatedTotal)
              : "$0.00"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="text-sm font-bold text-white">Student</h3>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={loading}
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none focus:border-violet-300/70"
            >
              <option value="">Choose student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name || "No name"} — {student.email}
                </option>
              ))}
            </select>

            <button
              onClick={assignStudent}
              disabled={!selectedStudentId || saving}
              className="mt-3 w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving..." : "Assign"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Assigned</h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                {assigned.length}
              </span>
            </div>

            <div className="space-y-2">
              {assigned.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-white/45">
                  No students assigned.
                </p>
              ) : (
                assigned.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedStudentId(item.studentId)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedStudentId === item.studentId
                        ? "border-violet-300/50 bg-violet-500/15"
                        : "border-white/10 bg-[#111827] hover:border-white/25"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      {item.student.name || "No name"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/45">
                      {item.student.email || "No email"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-transparent p-4">
            <p className="text-xs text-white/50">Currently managing</p>
            <h3 className="mt-1 text-xl font-bold text-white">
              {selectedStudent?.name || "Select a student"}
            </h3>
            <p className="mt-1 text-sm text-white/50">
              {selectedStudent?.email ||
                "Choose a student from the left to start scheduling."}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
            <form
              onSubmit={saveSession}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <h3 className="text-base font-bold text-white">
                {form.sessionId ? "Edit lesson" : "Add lesson"}
              </h3>

              <div className="mt-4 space-y-3">
                <input
                  type="date"
                  value={form.lessonDate}
                  onChange={(e) =>
                    setForm({ ...form, lessonDate: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none focus:border-violet-300/70"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none focus:border-violet-300/70"
                    required
                  />

                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none focus:border-violet-300/70"
                    required
                  />
                </div>

                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-300/70"
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!selectedStudentId || saving}
                    className="flex-1 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? "Saving..." : form.sessionId ? "Save" : "Add"}
                  </button>

                  {form.sessionId && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          sessionId: "",
                          lessonDate: "",
                          startTime: "",
                          endTime: "",
                          notes: "",
                        })
                      }
                      className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Lesson timeline
                  </h3>
                  <p className="mt-0.5 text-xs text-white/50">
                    Sessions for this student.
                  </p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {sessions.length} total
                </span>
              </div>

              {!selectedStudentId ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
                  <p className="text-sm text-white/50">
                    Choose a student first.
                  </p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
                  <p className="text-sm text-white/50">No lessons yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-white/10 bg-[#111827] p-3"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">
                            {prettyDate(session.lessonDate)}
                          </p>
                          <p className="mt-0.5 text-xs text-white/55">
                            {session.startTime} - {session.endTime}
                          </p>
                          {session.notes && (
                            <p className="mt-2 text-xs text-white/45">
                              {session.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                            {money(session.amount)}
                          </span>

                          <button
                            type="button"
                            onClick={() => editSession(session)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSession(session.id)}
                            className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}