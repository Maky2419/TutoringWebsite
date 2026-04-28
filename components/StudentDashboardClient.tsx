"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import StudentScheduleView from "./StudentScheduleView";
import TuitionPaymentBox from "./TuitionPaymentBox";

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
  tutorName: string;
  tutorEmail: string;
  tutorRate: number;
  assignmentTotal: string | number;
};

type Assignment = {
  id: number;
  accumulatedTotal: string | number;
  purchasedHours: string | number;
  usedHours: string | number;
  tutor: Tutor & {
    paymentFrequency: string;
  };
  sessions: {
    id: number;
    lessonDate: Date | string;
    startTime: string;
    endTime: string;
    notes: string | null;
    durationHours: string | number;
    amount: string | number;
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
  return `$${Number(value || 0).toFixed(2)}`;
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-white/60">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/50">{subtext}</p>
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
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/55">{subtitle}</p>}
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

  const recentSessions = [...allSessions]
    .sort(
      (a, b) =>
        new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/20 via-sky-500/10 to-emerald-500/10 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-200/80">
                Student dashboard
              </p>
              <h1 className="mt-3 text-4xl font-bold text-white">
                Welcome back, {userName}
              </h1>
              <p className="mt-3 max-w-2xl text-white/65">
                View your tutors, scheduled lessons, and learning progress from
                one place.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-white/60">Next session</p>
              {nextSession ? (
                <>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {nextSession.tutorName}
                  </p>
                  <p className="text-sm text-white/70">
                    {formatDate(nextSession.lessonDate)} ·{" "}
                    {nextSession.startTime} - {nextSession.endTime}
                  </p>
                  <p className="mt-2 text-sm text-emerald-300">
                    Session amount: {formatMoney(nextSession.amount)}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-white/60">
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

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <SectionCard
            title="Assigned tutors"
            subtitle="Overview of each tutor, rate, and total spending."
          >
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                  No tutors assigned yet.
                </div>
              ) : (
                assignments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {item.tutor.name}
                        </p>
                        <p className="text-sm text-white/60">
                          {item.tutor.email}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/75">
                          Rate: ${item.tutor.hourlyRate}/hr
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                          Total: {formatMoney(item.accumulatedTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Learning overview"
            subtitle="Live progress based on confirmed tutoring sessions."
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Total sessions</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stats.totalSessions}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Learning hours</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {totalHours.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Average session cost</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatMoney(averageSessionCost)}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
        <div className="mt-8">
  <TuitionPaymentBox assignments={assignments} />
</div>

        <div className="mt-8">
          
          <SectionCard
            title="Session calendar"
            subtitle="View your confirmed scheduled lessons by date."
          >
            <StudentScheduleView sessions={allSessions} />
          </SectionCard>
        </div>

        <div className="mt-8">
          <SectionCard
            title="Confirmed sessions"
            subtitle="Your upcoming and recent tutoring sessions. You can cancel a session from here."
          >
            <div className="space-y-3">
              {recentSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                  No confirmed sessions yet.
                </div>
              ) : (
                recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {session.tutorName}
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                          {formatDate(session.lessonDate)} ·{" "}
                          {session.startTime} - {session.endTime}
                        </p>
                        <p className="mt-2 text-sm text-emerald-300">
                          {formatMoney(session.amount)}
                        </p>
                        {session.notes && (
                          <p className="mt-2 text-sm text-white/55">
                            {session.notes}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => cancelSession(session.id)}
                        className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
                      >
                        Cancel session
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}