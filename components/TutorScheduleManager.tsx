"use client";

import { useEffect, useMemo, useState } from "react";

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

function formatMoney(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

function formatDateOnly(value: string) {
  return new Date(value).toISOString().split("T")[0];
}

export default function TutorScheduleManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assigned, setAssigned] = useState<AssignedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [scheduleData, setScheduleData] = useState<AssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sessionId: "",
    lessonDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

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

    if (res.ok) {
      setScheduleData(data);
    } else {
      setScheduleData(null);
      setMessage(data.error || "Failed to load sessions");
    }
  }

  async function initialLoad() {
    setLoading(true);
    await loadStudents();
    setLoading(false);
  }

  useEffect(() => {
    initialLoad();
  }, []);

  useEffect(() => {
    loadSchedule(selectedStudentId);
  }, [selectedStudentId]);

  const assignedStudentOptions = useMemo(
    () => assigned.map((a) => a.student),
    [assigned]
  );

  async function assignStudent() {
    if (!selectedStudentId) return;

    setSaving(true);
    setMessage("");

    const res = await fetch("/api/tutor/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedStudentId }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to assign student");
      return;
    }

    setMessage("Student assigned successfully");
    await loadStudents();
    await loadSchedule(selectedStudentId);
  }

  async function saveSession(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedStudentId) {
      setMessage("Select a student first");
      return;
    }

    setSaving(true);
    setMessage("");

    const isEditing = Boolean(form.sessionId);

    const res = await fetch("/api/tutor/sessions", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: selectedStudentId,
        sessionId: form.sessionId ? Number(form.sessionId) : undefined,
        lessonDate: form.lessonDate,
        startTime: form.startTime,
        endTime: form.endTime,
        notes: form.notes,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to save session");
      return;
    }

    setMessage(isEditing ? "Session updated" : "Session created");
    setForm({
      sessionId: "",
      lessonDate: "",
      startTime: "",
      endTime: "",
      notes: "",
    });
    await loadSchedule(selectedStudentId);
  }

  function editSession(session: TeachingSession) {
    setForm({
      sessionId: String(session.id),
      lessonDate: formatDateOnly(session.lessonDate),
      startTime: session.startTime,
      endTime: session.endTime,
      notes: session.notes || "",
    });
  }

  async function deleteSession(sessionId: number) {
    const res = await fetch("/api/tutor/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to delete session");
      return;
    }

    setMessage("Session deleted");
    await loadSchedule(selectedStudentId);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Assign Students</h2>
          <p className="mt-2 text-sm text-white/60">
            Choose a student, then assign them to yourself.
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-white/60">Loading...</p>
          ) : (
            <>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none"
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name || "No name"} — {student.email}
                  </option>
                ))}
              </select>

              <button
                onClick={assignStudent}
                disabled={saving || !selectedStudentId}
                className="mt-4 w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
              >
                Assign Student
              </button>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Current Total</h2>
          <p className="mt-2 text-sm text-white/60">
            This is saved in the database and updates when sessions change.
          </p>

          <div className="mt-6 text-4xl font-bold text-emerald-300">
            {scheduleData ? formatMoney(scheduleData.assignment.accumulatedTotal) : "$0.00"}
          </div>

          {scheduleData && (
            <p className="mt-3 text-sm text-white/60">
              Hourly rate: ${scheduleData.hourlyRate}/hr
            </p>
          )}
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
          {message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">
            {form.sessionId ? "Edit Session" : "Add Session"}
          </h2>

          <form onSubmit={saveSession} className="mt-4 space-y-4">
            <input
              type="date"
              value={form.lessonDate}
              onChange={(e) => setForm({ ...form, lessonDate: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none"
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none"
                required
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none"
                required
              />
            </div>

            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes"
              rows={4}
              className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || !selectedStudentId}
                className="rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
              >
                {form.sessionId ? "Save Changes" : "Add Session"}
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
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white hover:bg-white/10"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Calendar / Schedule</h2>

          {!scheduleData ? (
            <p className="mt-4 text-sm text-white/60">
              Assign and select a student to view the schedule.
            </p>
          ) : scheduleData.assignment.sessions.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">No sessions yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {scheduleData.assignment.sessions.map((session) => (
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

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => editSession(session)}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Assigned Students</h2>
        <div className="mt-4 space-y-3">
          {assignedStudentOptions.length === 0 ? (
            <p className="text-sm text-white/60">No students assigned yet.</p>
          ) : (
            assignedStudentOptions.map((student) => (
              <div
                key={student.id}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <p className="font-medium text-white">{student.name || "No name"}</p>
                <p className="text-sm text-white/60">{student.email}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}