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
  return `AED ${Number(value || 0).toFixed(2)}`;
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
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20";
  }

  if (value === "declined") {
    return "bg-rose-500/15 text-rose-200 border border-rose-400/20";
  }

  return "bg-amber-500/15 text-amber-200 border border-amber-400/20";
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
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/55">{subtitle}</p>}
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
      <p className="text-sm text-white/60">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/50">{subtext}</p>
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
    <div className="min-h-screen bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-emerald-500/10 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-200/80">
                Tutor dashboard
              </p>
              <h1 className="mt-3 text-4xl font-bold text-white">
                Welcome back, {userName}
              </h1>
              <p className="mt-3 max-w-2xl text-white/65">
                Manage students, schedule sessions, review bookings, and track
                your tutoring business in one place.
              </p>

              <a
                href="/tutor/account"
                className="mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Manage account
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Tutor profile</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {tutor.name}
              </p>
              <p className="text-sm text-white/70">{tutor.email}</p>
              <p className="mt-2 text-sm text-emerald-300">
                {formatMoney(tutor.hourlyRate)}/hr · {tutor.category}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title="Today’s Sessions"
            value={String(stats.todaysSessions)}
            subtext="Lessons scheduled for today"
          />
          <StatCard
            title="Active Students"
            value={String(stats.totalStudents)}
            subtext="Students assigned to you"
          />
          <StatCard
            title="Total Sessions"
            value={String(stats.totalSessions)}
            subtext="Active sessions recorded"
          />
          <StatCard
            title="Cancelled"
            value={String(cancelledSessions.length)}
            subtext="Sessions cancelled by students"
          />
          <StatCard
            title="Confirmed Paid"
            value={formatMoney(stats.totalConfirmedPaid || 0)}
            subtext="Manual bank transfers confirmed"
          />
          <StatCard
            title="Total Earnings"
            value={formatMoney(stats.totalEarnings)}
            subtext="Running revenue"
          />
        </div>

        <div className="mt-8">
          <SectionCard
            title="Manual payment confirmation"
            subtitle="Record how much a student has paid you by bank transfer."
          >
            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Select student
                </label>

                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setSelectedSessionId("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                >
                  <option value="">Choose a student</option>

                  {assignedStudents.map((assignment) => (
                    <option
                      key={assignment.student.id}
                      value={assignment.student.id}
                    >
                      {assignment.student.name ||
                        assignment.student.email ||
                        "Student"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Optional: link to session
                </label>

                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                >
                  <option value="">No specific session</option>

                  {allSessions
                    .filter(
                      (session) =>
                        !selectedStudentId ||
                        session.studentId === selectedStudentId
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
                <label className="mb-2 block text-sm text-white/60">
                  Amount paid
                </label>

                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Example: 200"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Note
                </label>

                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Example: Paid by bank transfer on May 15"
                  className="min-h-[100px] w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35"
                />
              </div>

              <button
                onClick={confirmManualPayment}
                className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                Confirm Payment Received
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_1fr]">
          <SectionCard
            title="Upcoming sessions"
            subtitle="Cancelled sessions are excluded from this list."
          >
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                  No upcoming sessions.
                </div>
              ) : (
                upcomingSessions.slice(0, 6).map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-black/30"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {session.studentName || "Student"}
                        </p>
                        <p className="text-sm text-white/60">
                          {session.studentEmail || "No email"}
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                          {formatDate(session.lessonDate)} ·{" "}
                          {session.startTime} - {session.endTime}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                        {formatMoney(session.amount)}
                      </div>
                    </div>

                    {session.notes && (
                      <p className="mt-3 text-sm text-white/55">
                        {session.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Top students"
            subtitle="A clean business-style overview of your student relationships."
          >
            <div className="space-y-4">
              {topStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                  No assigned students yet.
                </div>
              ) : (
                topStudents.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {assignment.student.name || "No name"}
                        </p>
                        <p className="text-sm text-white/60">
                          {assignment.student.email || "No email"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/75">
                        {assignment.sessions.length} sessions
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-emerald-300">
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
            title="Tutor calendar"
            subtitle="Green sessions are active. Red sessions were cancelled by students."
          >
            <TutorCalendar sessions={normalizedCalendarSessions} />
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_1fr]">
          <TutorScheduleManager />

          <div className="space-y-8">
            <SectionCard
              title="Recent booking requests"
              subtitle="Incoming booking requests from students."
            >
              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                    No booking requests yet.
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">
                          {booking.studentName}
                        </p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-white/60">
                        {booking.studentEmail}
                      </p>
                      <p className="mt-2 text-sm text-white/70">
                        Subject: {booking.subject}
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        Preferred times: {booking.preferredTimes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Business summary"
              subtitle="A simple but professional performance panel."
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">
                    Average revenue per student
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {assignedStudents.length > 0
                      ? formatMoney(stats.totalEarnings / assignedStudents.length)
                      : formatMoney(0)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">
                    Average revenue per active session
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stats.totalSessions > 0
                      ? formatMoney(stats.totalEarnings / stats.totalSessions)
                      : formatMoney(0)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Hourly rate</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-300">
                    {formatMoney(tutor.hourlyRate)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">
                    Pending unconfirmed payment
                  </p>
                  <p className="mt-2 text-3xl font-bold text-amber-300">
                    {formatMoney(stats.pendingPaymentAmount || 0)}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Recent payment confirmations"
              subtitle="Manual bank-transfer payments recorded by you."
            >
              <div className="space-y-4">
                {paymentConfirmations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                    No payment confirmations recorded yet.
                  </div>
                ) : (
                  paymentConfirmations.slice(0, 5).map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {payment.studentName}
                          </p>
                          <p className="text-sm text-white/60">
                            {payment.studentEmail}
                          </p>
                        </div>

                        <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300">
                          {formatMoney(payment.amountPaid)}
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-white/55">
                        {formatDate(payment.createdAt)}
                      </p>

                      {payment.note && (
                        <p className="mt-2 text-sm text-white/55">
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
    </div>
  );
}