"use client";
import type { CancellationInfo } from "@/lib/cancellationShared";
import SessionTimeDisplay from "./SessionTimeDisplay";
import { TimeZoneSelector, useTimeZone } from "./TimeZoneProvider";
import { addCalendarDays, sessionInstants, sessionTimeData, zonedParts } from "@/lib/sessionTime";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Money } from "@/components/CurrencyProvider";

type Student = {
  id: string;
  name: string | null;
  email: string | null;
};

type AssignedStudent = {
  id: number;
  studentId: string;
  customHourlyRate: string | number | null;
  student: Student;
};

type TeachingSession = CancellationInfo & {
  id: number;
  lessonDate: string;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  sourceTimeZone?: string | null;
  startTime: string;
  endTime: string;
  notes: string | null;
  durationHours: string | number;
  amount: string | number;
  status?: string;
};

type AssignmentResponse = {
  assignment: {
    id: number;
    accumulatedTotal: string | number;
    customHourlyRate: string | number | null;
    student: Student;
    sessions: TeachingSession[];
  };
  hourlyRate: number;
  tutorDefaultHourlyRate: number;
};

function addOneHour(time: string) {
  if (!time) return "";

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const nextHour = (hour + 1) % 24;

  return `${String(nextHour).padStart(2, "0")}:${minuteString}`;
}

export default function TutorScheduleManager({ cancellationRevision = 0 }: { cancellationRevision?: number }) {
  const { timeZone, ready } = useTimeZone();
  const router = useRouter();
  const [error, setError] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [assigned, setAssigned] = useState<AssignedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [scheduleData, setScheduleData] = useState<AssignmentResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customRate, setCustomRate] = useState("");
  const [rateMessage, setRateMessage] = useState("");
  const [repeatFourWeeks, setRepeatFourWeeks] = useState(false);

  const [form, setForm] = useState({
    sessionId: "",
    lessonDate: "",
    endDate: "",
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

  const sessions = [...(scheduleData?.assignment.sessions || [])].sort(
    (a, b) => sessionInstants(a).start.getTime() - sessionInstants(b).start.getTime()
  );
  const preview = useMemo(() => {
    if (!ready || !form.lessonDate || !form.startTime || !form.endTime) return null;
    try {
      return { session: sessionTimeData({ ...form, timeZone }), error: "" };
    } catch (error) {
      return { session: null, error: error instanceof Error ? error.message : "Invalid time" };
    }
  }, [form, timeZone, ready]);
  // Avoid reinterpreting a half-edited form when the user changes display zone.
  useEffect(() => {
    setForm({ sessionId: "", lessonDate: "", endDate: "", startTime: "", endTime: "", notes: "" });
    setRepeatFourWeeks(false);
    setError("");
  }, [timeZone]);

  const activeSessions = sessions.filter(
    (session) => session.status !== "cancelled"
  );

  const cancelledSessions = sessions.filter(
    (session) => session.status === "cancelled"
  );

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
    setCustomRate(res.ok && data.assignment.customHourlyRate != null ? String(data.assignment.customHourlyRate) : "");
    setRateMessage("");
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
  }, [selectedStudentId, cancellationRevision]);

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

  async function saveCustomRate() {
    if (!selectedStudentId || saving) return;
    setSaving(true);
    setRateMessage("");
    try {
      const res = await fetch("/api/tutor/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          customHourlyRate: customRate.trim() === "" ? null : Number(customRate),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save the rate.");
      await loadStudents();
      await loadSchedule(selectedStudentId);
      setRateMessage(customRate.trim() === "" ? "Using the tutor default rate." : "Custom rate saved for future lessons.");
      router.refresh();
    } catch (error) {
      setRateMessage(error instanceof Error ? error.message : "Failed to save the rate.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSession(e: FormEvent) {
    e.preventDefault();

    if (!selectedStudentId) return;

    if (!ready || saving) return;
    setSaving(true);
    setError("");
    const isEditing = Boolean(form.sessionId);
    try {
      const res = await fetch("/api/tutor/sessions", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          ...form, sessionId: isEditing ? Number(form.sessionId) : undefined,
          timeZone, repeatFourWeeks: repeatFourWeeks && !isEditing,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save lesson.");
      setForm({ sessionId: "", lessonDate: "", endDate: "", startTime: "", endTime: "", notes: "" });
      setRepeatFourWeeks(false);
      await loadSchedule(selectedStudentId);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save lesson.");
    } finally { setSaving(false); }
  }

  function editSession(session: TeachingSession) {
    if (session.status === "cancelled") return;

    setRepeatFourWeeks(false);

    const { start, end } = sessionInstants(session);
    const localStart = zonedParts(start, timeZone);
    const localEnd = zonedParts(end, timeZone);
    setForm({
      sessionId: String(session.id),
      lessonDate: localStart.date,
      endDate: localEnd.date,
      startTime: localStart.time,
      endTime: localEnd.time,
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
    router.refresh();
  }

  return (
    <div>
      <TimeZoneSelector disabled={saving} />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">
            Schedule Manager
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Assign students and manage lessons.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
            <p className="text-xs font-semibold text-green-700">
              Current total
            </p>
            <p className="text-2xl font-black text-green-700">
              {scheduleData ? (
                <Money amountUSD={scheduleData.assignment.accumulatedTotal} />
              ) : (
                <Money amountUSD={0} />
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs font-semibold text-red-700">Cancelled</p>
            <p className="text-2xl font-black text-red-700">
              {cancelledSessions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-950">Student</h3>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={loading}
              className="mt-3 w-full rounded-2xl border border-blue-100 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
              className="mt-3 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving..." : "Assign"}
            </button>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-950">Assigned</h3>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {assigned.length}
              </span>
            </div>

            <div className="space-y-2">
              {assigned.length === 0 ? (
                <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-3 text-xs text-slate-600">
                  No students assigned.
                </p>
              ) : (
                assigned.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedStudentId(item.studentId)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedStudentId === item.studentId
                        ? "border-blue-300 bg-blue-50"
                        : "border-blue-100 bg-white hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-950">
                      {item.student.name || "No name"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {item.student.email || "No email"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Currently managing
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-950">
              {selectedStudent?.name || "Select a student"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {selectedStudent?.email ||
                "Choose a student from the left to start scheduling."}
            </p>
            {scheduleData && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4">
                <label className="block text-sm font-bold text-slate-950" htmlFor="custom-hourly-rate">
                  Student hourly rate (USD)
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  Leave blank to use the tutor default of ${scheduleData.tutorDefaultHourlyRate.toFixed(2)}/hr. Changes apply only to future lessons.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="custom-hourly-rate"
                    type="number"
                    min="0.01"
                    max="100000"
                    step="0.01"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    placeholder={String(scheduleData.tutorDefaultHourlyRate)}
                    className="min-w-0 flex-1 rounded-xl border border-blue-100 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={saveCustomRate}
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40"
                  >
                    Save rate
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold text-blue-700">
                  Effective rate: ${scheduleData.hourlyRate.toFixed(2)}/hr
                </p>
                {rateMessage && <p className="mt-2 text-xs text-slate-600">{rateMessage}</p>}
              </div>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
            <form
              onSubmit={saveSession}
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-extrabold text-slate-950">
                {form.sessionId ? "Edit lesson" : "Add lesson"}
              </h3>

              <p className="mt-2 text-sm text-slate-600">Enter lesson times in {timeZone.replace(/_/g, " ")}. Changing the time zone clears this form.</p>
              {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
              <fieldset disabled={!ready || saving} className="mt-4 space-y-3">
                <label className="block text-xs font-bold text-slate-500" htmlFor="lesson-date">Start date</label>
                <input
                  id="lesson-date"
                  type="date"
                  value={form.lessonDate}
                  onChange={(e) =>
                    setForm({ ...form, lessonDate: e.target.value, endDate: e.target.value })
                  }
                  className="w-full rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-xs font-bold text-slate-500">
                      Start
                    </p>
                    <input
                      type="time"
                      step="900"
                      value={form.startTime}
                      onChange={(e) => {
                        const startTime = e.target.value;

                        setForm({
                          ...form,
                          startTime,
                          endTime: addOneHour(startTime),
                          endDate: form.lessonDate ? (startTime >= "23:00" ? addCalendarDays(form.lessonDate, 1) : form.lessonDate) : "",
                        });
                      }}
                      className="w-full rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-bold text-slate-500">End</p>
                    <input
                      type="time"
                      step="900"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm({ ...form, endTime: e.target.value })
                      }
                      className="w-full rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <label className="block text-xs font-bold text-slate-500">End date (choose next day for overnight lessons)
                  <input type="date" required min={form.lessonDate} value={form.endDate || form.lessonDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-slate-950" />
                </label>
                {preview?.session && <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900"><SessionTimeDisplay session={preview.session} /></div>}
                {preview?.session && scheduleData && (
                  <p className="text-sm font-semibold text-green-700">
                    Lesson charge: <Money amountUSD={preview.session.durationHours * scheduleData.hourlyRate} /> at <Money amountUSD={scheduleData.hourlyRate} suffix="/hr" />
                  </p>
                )}
                {preview?.error && <p role="alert" className="text-sm text-red-700">{preview.error}</p>}
                {!form.sessionId && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={repeatFourWeeks}
                        onChange={(e) => setRepeatFourWeeks(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600"
                      />

                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          Repeat weekly for 4 weeks (same local time)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={
                      !selectedStudentId ||
                      saving ||
                      !form.lessonDate ||
                      !form.startTime ||
                      !form.endTime || !ready || !!preview?.error
                    }
                    className="flex-1 rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving
                      ? "Saving..."
                      : form.sessionId
                      ? "Save"
                      : repeatFourWeeks
                      ? "Add 4 Lessons"
                      : "Add"}
                  </button>

                  {form.sessionId && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          sessionId: "",
                          lessonDate: "",
                          endDate: "",
                          startTime: "",
                          endTime: "",
                          notes: "",
                        })
                      }
                      className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </fieldset>
            </form>

            <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950">
                    Lesson timeline
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Sessions for this student.
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    {activeSessions.length} active
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    {cancelledSessions.length} cancelled
                  </span>
                </div>
              </div>

              {!selectedStudentId ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-center">
                  <p className="text-sm text-slate-600">
                    Choose a student first.
                  </p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-center">
                  <p className="text-sm text-slate-600">No lessons yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => {
                    const isCancelled = session.status === "cancelled";

                    return (
                      <div
                        key={session.id}
                        className={`rounded-xl border p-3 transition ${
                          isCancelled
                            ? "border-red-200 bg-red-50"
                            : "border-blue-100 bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-950">
                              <SessionTimeDisplay session={session} />
                            </p>



                            {session.notes && (
                              <p className="mt-2 text-xs text-slate-500">
                                {session.notes}
                              </p>
                            )}

                            {session.cancellationStatus && (
                              <p className="mt-2 text-xs font-semibold text-amber-800">
                                Cancellation {session.cancellationStatus}. {session.cancellationStatus === "pending" ? "Review this request in Cancellation Requests above." : ""}
                              </p>
                            )}
                            {session.cancellationReason && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-600">Reason: {session.cancellationReason}</p>}
                            {isCancelled && (
                              <p className="mt-2 text-xs font-bold text-red-700">
                                Session cancelled
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                isCancelled
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {isCancelled ? (
                                "Cancelled"
                              ) : (
                                <Money amountUSD={session.amount} />
                              )}
                            </span>

                            {!isCancelled && session.cancellationStatus !== "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => editSession(session)}
                                  className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteSession(session.id)}
                                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
