"use client";
import Link from "next/link";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import StudentScheduleView from "./StudentScheduleView";
import { generateInvoice } from "@/lib/generateInvoice";

type Tutor = {
  id: number;
  name: string;
  email: string;
  hourlyRate: number;
};

type Booking = {
  id: number;
  subject: string;
  preferredTimes: string;
  status: string;
  createdAt: Date | string;
  tutor: Tutor;
};

type TeachingSession = {
  id: number;
  lessonDate: Date | string;
  startTime: string;
  endTime: string;
  notes: string | null;
  durationHours: string | number;
  amount: string | number;
  status?: string;
  tutorName: string;
  tutorEmail: string;
  tutorRate: number;
  assignmentTotal: string | number;
  assignmentPaid?: string | number;
  assignmentRemaining?: string | number;
};

type Assignment = {
  id: number;
  accumulatedTotal: string | number;
  amountPaid?: string | number;
  remainingBalance?: string | number;
  tutor: Tutor;
  sessions: {
    id: number;
    lessonDate: Date | string;
    startTime: string;
    endTime: string;
    notes: string | null;
    durationHours: string | number;
    amount: string | number;
    status?: string;
  }[];
};

type Props = {
  userName: string;
  assignments: Assignment[];
  bookings: Booking[];
  allSessions: TeachingSession[];
  nextSession: TeachingSession | null;
  stats: {
    totalSpent: number;
    totalConfirmedPaid: number;
    remainingBalance: number;
    totalSessions: number;
    upcomingCount: number;
    completedSessions: number;
    assignedTutors: number;
    uniqueSubjectsCount: number;
    bookingStats: {
      pending: number;
      accepted: number;
      declined: number;
    };
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

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
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

export default function StudentDashboardClient({
  userName,
  assignments,
  allSessions,
  nextSession,
  stats,
}: Props) {
  const router = useRouter();

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

    router.refresh();
  }

  const totalHours = useMemo(() => {
    return allSessions.reduce(
      (sum, session) => sum + Number(session.durationHours || 0),
      0
    );
  }, [allSessions]);

  const averageSessionCost =
    allSessions.length > 0 ? stats.totalSpent / allSessions.length : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-100 p-8 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Student Dashboard
              </p>

              <h1 className="mt-3 text-4xl font-extrabold text-slate-950">
                Welcome back, {userName}
              </h1>


              <p className="mt-3 max-w-2xl text-slate-600">
                View your tutors, scheduled lessons, invoices, payments, and
                learning progress from one place.
              </p>

              
            </div>
            <Link
  href="/student/account"
  className="inline-flex rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
>
  Manage Account
</Link>

            <div className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Next Session
              </p>

              {nextSession ? (
                <>
                  <p className="mt-2 text-lg font-extrabold text-slate-950">
                    {nextSession.tutorName}
                  </p>

                  <p className="text-sm text-slate-600">
                    {formatDate(nextSession.lessonDate)} ·{" "}
                    {nextSession.startTime} - {nextSession.endTime}
                  </p>

                  <p className="mt-2 text-sm font-bold text-green-600">
                    Session amount: {formatMoney(nextSession.amount)}
                  </p>

                  <button
                    onClick={() => cancelSession(nextSession.id)}
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                  >
                    Cancel Session
                  </button>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  No upcoming session scheduled yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Assigned Tutors"
            value={String(stats.assignedTutors)}
            subtext="Tutors linked to your account"
          />

          <StatCard
            title="Upcoming Sessions"
            value={String(stats.upcomingCount)}
            subtext="Sessions still ahead of you"
          />

          <StatCard
            title="Completed Sessions"
            value={String(stats.completedSessions)}
            subtext="Lessons already finished"
          />

          <StatCard
            title="Total Spent"
            value={formatMoney(stats.totalSpent)}
            subtext="Running total across tutors"
          />
        </div>

        <div className="mt-8">
          <SectionCard
            title="Invoices & Payments"
            subtitle="Generate bank-transfer invoices and track tutor-confirmed payments."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Total billed</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">
                  {formatMoney(stats.totalSpent)}
                </p>
              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                <p className="text-sm text-slate-600">Confirmed paid</p>
                <p className="mt-2 text-3xl font-extrabold text-green-700">
                  {formatMoney(stats.totalConfirmedPaid)}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
                <p className="text-sm text-slate-600">Remaining balance</p>
                <p className="mt-2 text-3xl font-extrabold text-yellow-700">
                  {formatMoney(stats.remainingBalance)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No tutors assigned yet, so no invoice can be generated.
                </p>
              ) : (
                assignments.map((assignment) => {
                  const tutorSessions = allSessions.filter(
                    (session) =>
                      session.tutorEmail === assignment.tutor.email &&
                      session.status !== "cancelled"
                  );

                  return (
                    <button
                      key={assignment.id}
                      onClick={() =>
                        generateInvoice({
                          studentName: userName || "Student",
                          tutorName: assignment.tutor.name || "Tutor",
                          subject: "Tutoring",
                          sessions: tutorSessions,
                          amountPaid: Number(assignment.amountPaid || 0),
                        })
                      }
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Generate Invoice for {assignment.tutor.name}
                    </button>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <SectionCard
            title="Assigned Tutors"
            subtitle="Overview of each tutor, rate, and payment status."
          >
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-slate-600">
                  No tutors assigned yet.
                </div>
              ) : (
                assignments.map((item) => {
                  const amountPaid = Number(item.amountPaid || 0);
                  const remaining = Math.max(
                    Number(item.accumulatedTotal || 0) - amountPaid,
                    0
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-blue-100 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-extrabold text-slate-950">
                            {item.tutor.name}
                          </p>

                          <p className="text-sm text-slate-600">
                            {item.tutor.email}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                            Rate: {formatMoney(item.tutor.hourlyRate)}/hr
                          </div>

                          <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                            Billed: {formatMoney(item.accumulatedTotal)}
                          </div>

                          <div className="rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                            Paid: {formatMoney(amountPaid)}
                          </div>

                          <div className="rounded-xl bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-700">
                            Remaining: {formatMoney(remaining)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Learning Overview"
            subtitle="Live progress based on confirmed tutoring sessions."
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Total sessions</p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-950">
                    {stats.totalSessions}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Learning hours</p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-950">
                    {totalHours.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Average session cost</p>

                <p className="mt-2 text-3xl font-extrabold text-slate-950">
                  {formatMoney(averageSessionCost)}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-8">
          <SectionCard
            title="Session Calendar"
            subtitle="View your confirmed scheduled lessons by date."
          >
            <StudentScheduleView sessions={allSessions} />
          </SectionCard>
        </div>
      </div>
    </main>
  );
}