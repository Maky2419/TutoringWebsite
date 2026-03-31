import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import TutorDashboardClient from "../../../components/TutorDashboardClient";

export default async function TutorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "TUTOR") redirect("/dashboard");

  const userId = (session.user as any).id;

  const tutor = await prisma.tutor.findFirst({
    where: { userId },
    include: {
      assignedStudents: {
        include: {
          student: true,
          sessions: {
            orderBy: { lessonDate: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tutor) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">
          No tutor profile exists for this account yet.
        </div>
      </div>
    );
  }

  const now = new Date();

  const allSessions = tutor.assignedStudents.flatMap((assignment) =>
    assignment.sessions.map((session) => ({
      ...session,
      studentName: assignment.student.name,
      studentEmail: assignment.student.email,
    }))
  );

  const sortedUpcomingSessions = allSessions
    .filter((session) => new Date(session.lessonDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
    );

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const todaysSessions = allSessions.filter(
    (session) => new Date(session.lessonDate).toISOString().split("T")[0] === todayStr
  ).length;

  const totalEarnings = tutor.assignedStudents.reduce(
    (sum, assignment) => sum + Number(assignment.accumulatedTotal),
    0
  );

  const totalStudents = tutor.assignedStudents.length;

  const totalSessions = allSessions.length;

  const pendingBookings = tutor.bookings.filter(
    (booking) => booking.status.toLowerCase() === "pending"
  ).length;

  return (
    <TutorDashboardClient
      tutor={{
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        hourlyRate: tutor.hourlyRate,
        category: tutor.category,
      }}
      userName={session.user.name || tutor.name}
      assignedStudents={tutor.assignedStudents}
      bookings={tutor.bookings}
      allSessions={allSessions}
      upcomingSessions={sortedUpcomingSessions}
      stats={{
        todaysSessions,
        totalEarnings,
        totalStudents,
        totalSessions,
        pendingBookings,
      }}
    />
  );
}