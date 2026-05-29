"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import TutorScheduleManager from "./TutorScheduleManager";
import TutorCalendar from "./TutorCalendar";

type Student = {
  id: string;
  name: string | null;
  email: string | null;
};

type SessionBase = {
  id: number;
  lessonDate: Date | string;
  startTime: string;
  endTime: string;
  notes: string | null;
  durationHours: string | number;
  amount: string | number;
  status?: string;
};

type AssignedStudent = {
  id: number;
  studentId: string;
  accumulatedTotal: string | number;
  student: Student;
  sessions: SessionBase[];
};

type Booking = {
  id: number;
  subject: string;
  preferredTimes: string;
  status: string;
  createdAt: Date | string;
  studentName: string;
  studentEmail: string;
};

type TutorInfo = {
  id: number;
  name: string;
  email: string;
  hourlyRate: number;
  category: string;
};

type SessionRow = SessionBase & {
  studentId?: string;
  studentName: string | null;
  studentEmail: string | null;
};

type Props = {
  tutor: TutorInfo;
  userName: string;
  assignedStudents: AssignedStudent[];
  bookings: Booking[];
  allSessions: SessionRow[];
  upcomingSessions: SessionRow[];
  calendarSessions: SessionRow[];
  paymentConfirmations?: {
    id: number;
    studentId: string;
    studentName: string;
    studentEmail: string;
    teachingSessionId: number | null;
    amountPaid: number;
    confirmed: boolean;
    note: string | null;
    createdAt: string;
  }[];
  stats: {
    todaysSessions: number;
    totalEarnings: number;
    totalConfirmedPaid?: number;
    pendingPaymentAmount?: number;
    totalStudents: number;
    totalSessions: number;
    pendingBookings: number;
  };
};

function formatMoney(value: number | string) {
  return `$${Number(value || 0).toFixed(2)} USD`;
}

function formatDate(dateValue: Date | string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusClasses(status: string) {
  const value = status.toLowerCase();

  if (value === "accepted") {
    return "bg-green-50 text-green-700 border border-green-200";
  }

  if (value === "declined") {
    return "bg-red-50 text-red-700 border border-red-200";
  }

  return "bg-yellow-50 text-yellow-700 border border-yellow-200";
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  title,
  value,
  subtext,
}: {
  title: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{subtext}</p>
    </div>
  );
}

export default function TutorDashboardClient({
  tutor,
  userName,
  assignedStudents,
  bookings,
  allSessions,
  upcomingSessions,
  calendarSessions,
  paymentConfirmations = [],
  stats,
}: Props) {
  const router = useRouter();

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  async function confirmManualPayment() {
    if (!selectedStudentId || !amountPaid) {
      alert("Please select a student and enter the amount paid.");
      return;
    }

    const res = await fetch("/api/tutor/payment-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tutorId: tutor.id,
        studentId: selectedStudentId,
        teachingSessionId: selectedSessionId || null,
        amountPaid: Number(amountPaid),
        note: paymentNote,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to confirm payment.");
      return;
    }

    alert("Payment confirmation saved.");

    setSelectedStudentId("");
    setSelectedSessionId("");
    setAmountPaid("");
    setPaymentNote("");

    router.refresh();
  }

  const recentBookings = bookings.slice(0, 5);

  const topStudents = [...assignedStudents]
    .sort((a, b) => Number(b.accumulatedTotal) - Number(a.accumulatedTotal))
    .slice(0, 5);

  const cancelledSessions = allSessions.filter(
    (session) => session.status === "cancelled"
  );

  const normalizedCalendarSessions = calendarSessions.map((session) => ({
    id: session.id,
    lessonDate:
      session.lessonDate instanceof Date
        ? session.lessonDate.toISOString()
        : session.lessonDate,
    startTime: session.startTime,
    endTime: session.endTime,
    studentName: session.studentName,
    studentEmail: session.studentEmail,
    amount: Number(session.amount),
    status: session.status,
  }));

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-100 p-8 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Tutor Dashboard
              </p>

              <h1 className="mt-3 text-4xl font-extrabold text-slate-950">
                Welcome back, {userName}
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                Manage students, schedule sessions, review bookings, and track
                your tutoring business in one place.
              </p>

              <a
                href="/tutor/account"
                className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Manage Account
              </a>
            </div>

            <div className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Tutor Profile
              </p>
              <p className="mt-2 text-lg font-extrabold text-slate-950">
                {tutor.name}
              </p>
              <p className="text-sm text-slate-600">{tutor.email}</p>
              <p className="mt-2 text-sm font-bold text-green-600">
                {formatMoney(tutor.hourlyRate)}/hr · {tutor.category}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Today’s Sessions" value={String(stats.todaysSessions)} subtext="Lessons scheduled for today" />
          <StatCard title="Active Students" value={String(stats.totalStudents)} subtext="Students assigned to you" />
          <StatCard title="Total Sessions" value={String(stats.totalSessions)} subtext="Active sessions recorded" />
          <StatCard title="Cancelled" value={String(cancelledSessions.length)} subtext="Sessions cancelled" />
          <StatCard title="Confirmed Paid" value={formatMoney(stats.totalConfirmedPaid || 0)} subtext="Transfers confirmed" />
          <StatCard title="Total Earnings" value={formatMoney(stats.totalEarnings)} subtext="Running revenue" />
        </div>

        <div className="mt-8">
          <SectionCard
            title="Manual Payment Confirmation"
            subtitle="Record how much a student has paid you by bank transfer."
          >
            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select student
                </label>

                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setSelectedSessionId("");
                  }}
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Choose a student</option>
                  {assignedStudents.map((assignment) => (
                    <option key={assignment.student.id} value={assignment.student.id}>
                      {assignment.student.name || assignment.student.email || "Student"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Optional: link to session
                </label>

                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">No specific session</option>
                  {allSessions
                    .filter(
                      (session) =>
                        !selectedStudentId || session.studentId === selectedStudentId
                    )
                    .map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.studentName || "Student"} —{" "}
                        {formatDate(session.lessonDate)} —{" "}
                        {formatMoney(session.amount)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Amount paid
                </label>

                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Example: 200"
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Note
                </label>

                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Example: Paid by bank transfer on May 15"
                  className="min-h-[100px] w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                onClick={confirmManualPayment}
                className="rounded-2xl bg-green-500 px-5 py-3 font-bold text-white transition hover:bg-green-600"
              >
                Confirm Payment Received
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_1fr]">
          <SectionCard
            title="Upcoming Sessions"
            subtitle="Cancelled sessions are excluded from this list."
          >
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-slate-600">
                  No upcoming sessions.
                </div>
              ) : (
                upcomingSessions.slice(0, 6).map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-blue-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-extrabold text-slate-950">
                          {session.studentName || "Student"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {session.studentEmail || "No email"}
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          {formatDate(session.lessonDate)} ·{" "}
                          {session.startTime} - {session.endTime}
                        </p>
                      </div>

                      <div className="rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                        {formatMoney(session.amount)}
                      </div>
                    </div>

                    {session.notes && (
                      <p className="mt-3 text-sm text-slate-500">
                        {session.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Top Students"
            subtitle="Overview of your student relationships."
          >
            <div className="space-y-4">
              {topStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-slate-600">
                  No assigned students yet.
                </div>
              ) : (
                topStudents.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border border-blue-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-slate-950">
                          {assignment.student.name || "No name"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {assignment.student.email || "No email"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                        {assignment.sessions.length} sessions
                      </div>
                    </div>

                    <p className="mt-3 text-sm font-bold text-green-600">
                      Total billed: {formatMoney(assignment.accumulatedTotal)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8">
          <SectionCard
            title="Tutor Calendar"
            subtitle="Green sessions are active. Red sessions were cancelled by students."
          >
            <TutorCalendar sessions={normalizedCalendarSessions} />
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_1fr]">
          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
            <TutorScheduleManager />
          </div>

          <div className="space-y-8">
            <SectionCard
              title="Recent Booking Requests"
              subtitle="Incoming booking requests from students."
            >
              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-slate-600">
                    No booking requests yet.
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-blue-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-extrabold text-slate-950">
                          {booking.studentName}
                        </p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {booking.studentEmail}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        Subject: {booking.subject}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Preferred times: {booking.preferredTimes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard title="Business Summary" subtitle="Performance panel.">
              <div className="space-y-4">
                {[
                  [
                    "Average revenue per student",
                    assignedStudents.length > 0
                      ? formatMoney(stats.totalEarnings / assignedStudents.length)
                      : formatMoney(0),
                  ],
                  [
                    "Average revenue per active session",
                    stats.totalSessions > 0
                      ? formatMoney(stats.totalEarnings / stats.totalSessions)
                      : formatMoney(0),
                  ],
                  ["Hourly rate", formatMoney(tutor.hourlyRate)],
                  [
                    "Pending unconfirmed payment",
                    formatMoney(stats.pendingPaymentAmount || 0),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-blue-100 bg-slate-50 p-4"
                  >
                    <p className="text-sm text-slate-600">{label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-950">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Recent Payment Confirmations"
              subtitle="Manual bank-transfer payments recorded by you."
            >
              <div className="space-y-4">
                {paymentConfirmations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-slate-600">
                    No payment confirmations recorded yet.
                  </div>
                ) : (
                  paymentConfirmations.slice(0, 5).map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-blue-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-slate-950">
                            {payment.studentName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {payment.studentEmail}
                          </p>
                        </div>

                        <div className="rounded-xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
                          {formatMoney(payment.amountPaid)}
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatDate(payment.createdAt)}
                      </p>

                      {payment.note && (
                        <p className="mt-2 text-sm text-slate-500">
                          {payment.note}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}