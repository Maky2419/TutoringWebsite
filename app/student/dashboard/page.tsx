import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import StudentScheduleView from "../../../components/StudentScheduleView";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "STUDENT") redirect("/dashboard");

  const userId = (session.user as any).id;

  const [assignments, bookings] = await Promise.all([
    prisma.studentTutorAssignment.findMany({
      where: { studentId: userId },
      include: {
        tutor: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { studentUserId: userId },
      include: {
        tutor: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-bold text-white">Student Dashboard</h1>
      <p className="mt-2 text-white/60">
        Welcome back, {session.user.name || "Student"}.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Assigned Tutors</h2>
          <div className="mt-4 space-y-3">
            {assignments.length === 0 ? (
              <p className="text-sm text-white/60">No tutors assigned yet.</p>
            ) : (
              assignments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="font-medium text-white">{item.tutor.name}</p>
                  <p className="text-sm text-white/60">{item.tutor.email}</p>
                  <p className="mt-1 text-sm text-white/70">
                    Rate: ${item.tutor.hourlyRate}/hr
                  </p>
                  <p className="mt-1 text-sm text-emerald-300">
                    Total so far: ${Number(item.accumulatedTotal).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">My Bookings</h2>
          <div className="mt-4 space-y-3">
            {bookings.length === 0 ? (
              <p className="text-sm text-white/60">No bookings yet.</p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="font-medium text-white">{booking.subject}</p>
                  <p className="text-sm text-white/60">
                    Tutor: {booking.tutor.name}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Preferred Times: {booking.preferredTimes}
                  </p>
                  <p className="mt-1 text-xs text-emerald-300">
                    {booking.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Lesson Schedule</h2>
          <p className="mt-2 text-sm text-white/60">
            This view is read-only for students.
          </p>

          <div className="mt-6">
            <StudentScheduleView />
          </div>
        </div>
      </div>
    </div>
  );
}