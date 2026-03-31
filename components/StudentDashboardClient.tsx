"use client";

import { useMemo, useState } from "react";
import StudentScheduleView from "./StudentScheduleView";

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
  tutor: Tutor;
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
  return `$${Number(value).toFixed(2)}`;
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
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
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
  bookings,
  allSessions,
  nextSession,
  stats,
}: Props) {
  const [bookingTab, setBookingTab] = useState<"all" | "pending" | "accepted" | "declined">("all");

  const filteredBookings = useMemo(() => {
    if (bookingTab === "all") return bookings;
    return bookings.filter(
      (booking) => booking.status.toLowerCase() === bookingTab
    );
  }, [bookings, bookingTab]);

  const recentSessions = [...allSessions]
    .sort(
      (a, b) =>
        new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/20 via-sky-500/10 to-emerald-500/10 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-200/80">
                Student dashboard
              </p>
              <h1 className="mt-3 text-4xl font-bold text-white">
                Welcome back, {userName}
              </h1>
              <p className="mt-3 max-w-2xl text-white/65">
                Manage your tutors, sessions, bookings, and progress from one place.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Next session</p>
              {nextSession ? (
                <>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {nextSession.tutorName}
                  </p>
                  <p className="text-sm text-white/70">
                    {formatDate(nextSession.lessonDate)} · {nextSession.startTime} -{" "}
                    {nextSession.endTime}
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
            subtext="Tutors currently linked to your account"
          />
          <StatCard
            title="Upcoming Sessions"
            value={String(stats.upcomingCount)}
            subtext="Sessions still ahead of you"
          />
          <StatCard
            title="Completed Sessions"
            value={String(stats.completedSessions)}
            subtext="Lessons you have already finished"
          />
          <StatCard
            title="Total Spent"
            value={formatMoney(stats.totalSpent)}
            subtext="Running total across your tutor assignments"
          />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <SectionCard
            title="Assigned tutors"
            subtitle="A clean overview of each tutor, rate, and total spending."
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
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-black/30"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {item.tutor.name}
                        </p>
                        <p className="text-sm text-white/60">{item.tutor.email}</p>
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

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-wide text-white/45">
                          Sessions
                        </p>
                        <p className="mt-1 text-xl font-semibold text-white">
                          {item.sessions.length}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-wide text-white/45">
                          Hourly Rate
                        </p>
                        <p className="mt-1 text-xl font-semibold text-white">
                          ${item.tutor.hourlyRate}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-wide text-white/45">
                          Running Total
                        </p>
                        <p className="mt-1 text-xl font-semibold text-emerald-300">
                          {formatMoney(item.accumulatedTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Learning overview"
            subtitle="A more professional progress snapshot."
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Subjects requested</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.uniqueSubjectsCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Total sessions tracked</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.totalSessions}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Booking pipeline</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm text-white/70">
                      <span>Pending</span>
                      <span>{stats.bookingStats.pending}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-amber-300"
                        style={{
                          width: `${Math.min(stats.bookingStats.pending * 20, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm text-white/70">
                      <span>Accepted</span>
                      <span>{stats.bookingStats.accepted}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-emerald-300"
                        style={{
                          width: `${Math.min(stats.bookingStats.accepted * 20, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm text-white/70">
                      <span>Declined</span>
                      <span>{stats.bookingStats.declined}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-rose-300"
                        style={{
                          width: `${Math.min(stats.bookingStats.declined * 20, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-8">
          <SectionCard
            title="My bookings"
            subtitle="Use tabs to make the booking experience feel more organized and professional."
          >
            <div className="mb-5 flex flex-wrap gap-3">
              {["all", "pending", "accepted", "declined"].map((tab) => {
                const active = bookingTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() =>
                      setBookingTab(tab as "all" | "pending" | "accepted" | "declined")
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-white text-slate-900"
                        : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                  No bookings in this category.
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-black/30"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-semibold text-white">
                            {booking.subject}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-white/65">
                          Tutor: {booking.tutor.name}
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          {booking.tutor.email}
                        </p>
                        <p className="mt-3 text-sm text-white/70">
                          Preferred times: {booking.preferredTimes}
                        </p>
                      </div>

                      <div className="grid min-w-[220px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <button className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
                          View Details
                        </button>
                        <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                          Request Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8">
  <SectionCard
    title="Session calendar"
    subtitle="View your scheduled lessons in a real calendar and check upcoming sessions by date."
  >
    <StudentScheduleView />
  </SectionCard>
</div>

<div className="mt-8">
  <SectionCard
    title="Recent activity"
    subtitle="Recent sessions make the dashboard feel alive and useful."
  >
            <div className="space-y-3">
              {recentSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                  No session activity yet.
                </div>
              ) : (
                recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="font-semibold text-white">{session.tutorName}</p>
                    <p className="mt-1 text-sm text-white/60">
                      {formatDate(session.lessonDate)} · {session.startTime} -{" "}
                      {session.endTime}
                    </p>
                    <p className="mt-2 text-sm text-emerald-300">
                      {formatMoney(session.amount)}
                    </p>
                    {session.notes && (
                      <p className="mt-2 text-sm text-white/55">{session.notes}</p>
                    )}
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