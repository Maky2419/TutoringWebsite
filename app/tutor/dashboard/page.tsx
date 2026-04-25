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

  const assignedStudents = tutor.assignedStudents.map((assignment) => ({
    id: assignment.id,
    studentId: assignment.studentId,
    accumulatedTotal: Number(assignment.accumulatedTotal),
    student: {
      id: assignment.student.id,
      name: assignment.student.name,
      email: assignment.student.email,
    },
    sessions: assignment.sessions.map((s) => ({
      id: s.id,
      lessonDate: s.lessonDate.toISOString(),
      startTime: s.startTime,
      endTime: s.endTime,
      notes: s.notes,
      durationHours: Number(s.durationHours),
      amount: Number(s.amount),
    })),
  }));

  const bookings = tutor.bookings.map((b) => ({
    id: b.id,
    subject: b.subject,
    preferredTimes: b.preferredTimes,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    studentName: b.studentName,
    studentEmail: b.studentEmail,
  }));

  const allSessions = assignedStudents.flatMap((assignment) =>
    assignment.sessions.map((s) => ({
      ...s,
      studentName: assignment.student.name,
      studentEmail: assignment.student.email,
    }))
  );

  const upcomingSessions = allSessions
    .filter((s) => new Date(s.lessonDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
    );

  const todayStr = now.toISOString().split("T")[0];

  const todaysSessions = allSessions.filter(
    (s) => new Date(s.lessonDate).toISOString().split("T")[0] === todayStr
  ).length;

  const totalEarnings = assignedStudents.reduce(
    (sum, assignment) => sum + Number(assignment.accumulatedTotal),
    0
  );

  const pendingBookings = bookings.filter(
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
      assignedStudents={assignedStudents}
      bookings={bookings}
      allSessions={allSessions}
      upcomingSessions={upcomingSessions}
      calendarSessions={allSessions}
      stats={{
        todaysSessions,
        totalEarnings,
        totalStudents: assignedStudents.length,
        totalSessions: allSessions.length,
        pendingBookings,
      }}
    />
  );
}