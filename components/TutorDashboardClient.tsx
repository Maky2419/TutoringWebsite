"use client";

import TutorScheduleManager from "./TutorScheduleManager";

type Student = {
  id: string;
  name: string | null;
  email: string | null;
};

type AssignedStudent = {
  id: number;
  studentId: string;
  accumulatedTotal: string | number;
  student: Student;
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

type SessionRow = {
  id: number;
  lessonDate: Date | string;
  startTime: string;
  endTime: string;
  notes: string | null;
  durationHours: string | number;
  amount: string | number;
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
  stats: {
    todaysSessions: number;
    totalEarnings: number;
    totalStudents: number;
    totalSessions: number;
    pendingBookings: number;
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

export default function TutorDashboardClient({
  tutor,
  userName,
  assignedStudents,
  bookings,
  allSessions,
  upcomingSessions,
  stats,
}: Props) {
  const recentBookings = bookings.slice(0, 5);
  const topStudents = [...assignedStudents]
    .sort(
      (a, b) => Number(b.accumulatedTotal) - Number(a.accumulatedTotal)
    )
    .slice(0, 5);

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
            </div>
            <a
  href="/tutor/account"
  className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
>
  Manage account
</a>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Tutor profile</p>
              <p className="mt-2 text-lg font-semibold text-white">{tutor.name}</p>
              <p className="text-sm text-white/70">{tutor.email}</p>
              <p className="mt-2 text-sm text-emerald-300">
                ${tutor.hourlyRate}/hr · {tutor.category}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Today’s Sessions"
            value={String(stats.todaysSessions)}
            subtext="Lessons scheduled for today"
          />
          <StatCard
            title="Active Students"
            value={String(stats.totalStudents)}
            subtext="Students currently assigned to you"
          />
          <StatCard
            title="Total Sessions"
            value={String(stats.totalSessions)}
            subtext="All sessions recorded so far"
          />
          <StatCard
            title="Pending Bookings"
            value={String(stats.pendingBookings)}
            subtext="Booking requests waiting on action"
          />
          <StatCard
            title="Total Earnings"
            value={formatMoney(stats.totalEarnings)}
            subtext="Running revenue from your assigned students"
          />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_1fr]">
          <SectionCard
            title="Upcoming sessions"
            subtitle="This gives tutors a fast operational view of what is coming next."
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
                          {formatDate(session.lessonDate)} · {session.startTime} -{" "}
                          {session.endTime}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                        {formatMoney(session.amount)}
                      </div>
                    </div>

                    {session.notes && (
                      <p className="mt-3 text-sm text-white/55">{session.notes}</p>
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

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_1fr]">
          <SectionCard
            title="Schedule manager"
            subtitle="This is the core working area for tutors, now placed inside a more polished dashboard."
          >
            <TutorScheduleManager />
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              title="Recent booking requests"
              subtitle="This makes the tutor dashboard feel more like a real service platform."
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
                  <p className="text-sm text-white/55">Average revenue per student</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {assignedStudents.length > 0
                      ? formatMoney(stats.totalEarnings / assignedStudents.length)
                      : "$0.00"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Average revenue per session</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {allSessions.length > 0
                      ? formatMoney(stats.totalEarnings / allSessions.length)
                      : "$0.00"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Hourly rate</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-300">
                    ${tutor.hourlyRate}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}