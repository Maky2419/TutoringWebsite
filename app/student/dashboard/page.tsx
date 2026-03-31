import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import StudentDashboardClient from "../../../components/StudentDashboardClient";

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
        sessions: {
          orderBy: { lessonDate: "asc" },
        },
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

  const allSessions = assignments.flatMap((assignment) =>
    assignment.sessions.map((session) => ({
      ...session,
      tutorName: assignment.tutor.name,
      tutorEmail: assignment.tutor.email,
      tutorRate: assignment.tutor.hourlyRate,
      assignmentTotal: assignment.accumulatedTotal,
    }))
  );

  const now = new Date();

  const sortedUpcomingSessions = allSessions
    .filter((session) => new Date(session.lessonDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
    );

  const nextSession = sortedUpcomingSessions[0] || null;

  const totalSpent = assignments.reduce(
    (sum, assignment) => sum + Number(assignment.accumulatedTotal),
    0
  );

  const totalSessions = allSessions.length;

  const upcomingCount = sortedUpcomingSessions.length;

  const completedSessions = allSessions.filter(
    (session) => new Date(session.lessonDate) < now
  ).length;

  const uniqueSubjects = Array.from(new Set(bookings.map((b) => b.subject)));

  const bookingStats = {
    pending: bookings.filter((b) => b.status.toLowerCase() === "pending").length,
    accepted: bookings.filter((b) => b.status.toLowerCase() === "accepted").length,
    declined: bookings.filter((b) => b.status.toLowerCase() === "declined").length,
  };

  return (
    <StudentDashboardClient
      userName={session.user.name || "Student"}
      assignments={assignments}
      bookings={bookings}
      allSessions={allSessions}
      nextSession={nextSession}
      stats={{
        totalSpent,
        totalSessions,
        upcomingCount,
        completedSessions,
        assignedTutors: assignments.length,
        uniqueSubjectsCount: uniqueSubjects.length,
        bookingStats,
      }}
    />
  );
}