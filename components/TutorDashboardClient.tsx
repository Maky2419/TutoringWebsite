"use client";

import { useEffect, useState } from "react";

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

export default function TutorDashboardClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assigned, setAssigned] = useState<AssignedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/tutor/students");
    const data = await res.json();
    setStudents(data.students || []);
    setAssigned(data.assignedStudents || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function assignStudent() {
    if (!selectedStudentId) return;

    setSaving(true);
    setMessage("");

    const res = await fetch("/api/tutor/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ studentId: selectedStudentId }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to assign student");
      return;
    }

    setMessage("Student assigned successfully");
    setSelectedStudentId("");
    loadData();
  }

  async function removeStudent(studentId: string) {
    const res = await fetch("/api/tutor/students", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ studentId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to remove student");
      return;
    }

    setMessage("Student removed successfully");
    loadData();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Assign Students</h2>
        <p className="mt-2 text-sm text-white/60">
          Choose a student and assign them to yourself.
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
              disabled={saving}
              className="mt-4 w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {saving ? "Assigning..." : "Assign Student"}
            </button>
          </>
        )}

        {message && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
            {message}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">My Students</h2>

        <div className="mt-4 space-y-3">
          {assigned.length === 0 ? (
            <p className="text-sm text-white/60">No students assigned yet.</p>
          ) : (
            assigned.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div>
                  <p className="font-medium text-white">{item.student.name || "No name"}</p>
                  <p className="text-sm text-white/60">{item.student.email}</p>
                </div>

                <button
                  onClick={() => removeStudent(item.studentId)}
                  className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}