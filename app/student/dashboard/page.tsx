import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentDashboardClient from "@/components/StudentDashboardClient";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "STUDENT") redirect("/dashboard");

  const userId = (session.user as any).id;
  const userEmail = session?.user?.email || "";

  const [rawAssignments, rawBookings, rawPayments] = await Promise.all([
    prisma.studentTutorAssignment.findMany({
      where: {
        OR: [{ studentId: userId }, { student: { email: userEmail } }],
      },
      include: {
        tutor: true,
        student: true,
        sessions: {
          orderBy: { lessonDate: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.booking.findMany({
      where: {
        OR: [{ studentUserId: userId }, { studentEmail: userEmail }],
      },
      include: {
        tutor: true,
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.tutorPaymentConfirmation.findMany({
      where: {
        studentId: userId,
        confirmed: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const assignments = rawAssignments.map((assignment) => {
    const activeSessions = assignment.sessions.filter(
      (s) => s.status !== "cancelled"
    );

    const totalBilled = activeSessions.reduce(
      (sum, s) => sum + Number(s.amount),
      0
    );

    const totalPaidForTutor = rawPayments
      .filter((payment) => payment.tutorId === assignment.tutorId)
      .reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0);

    return {
      id: assignment.id,
      accumulatedTotal: totalBilled,
      amountPaid: totalPaidForTutor,
      remainingBalance: Math.max(totalBilled - totalPaidForTutor, 0),

      tutor: {
        id: assignment.tutor.id,
        name: assignment.tutor.name,
        email: assignment.tutor.email,
        hourlyRate: assignment.tutor.hourlyRate,
      },

      student: {
        id: assignment.student?.id,
        name: assignment.student?.name,
        email: assignment.student?.email,
      },

      sessions: activeSessions.map((s) => ({
        id: s.id,
        lessonDate: s.lessonDate.toISOString(),
        startTime: s.startTime,
        endTime: s.endTime,
        notes: s.notes,
        durationHours: Number(s.durationHours),
        amount: Number(s.amount),
        status: s.status,
      })),
    };
  });

  const bookings = rawBookings.map((b) => ({
    id: b.id,
    subject: b.subject,
    preferredTimes: b.preferredTimes,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    tutor: {
      id: b.tutor.id,
      name: b.tutor.name,
      email: b.tutor.email,
      hourlyRate: b.tutor.hourlyRate,
    },
  }));

  const allSessions = assignments.flatMap((assignment) =>
    assignment.sessions.map((s) => ({
      ...s,
      studentName: assignment.student?.name || session?.user?.name || "Student",
      studentEmail: assignment.student?.email || session?.user?.email || "",
      tutorName: assignment.tutor.name,
      tutorEmail: assignment.tutor.email,
      tutorRate: assignment.tutor.hourlyRate,
      assignmentTotal: assignment.accumulatedTotal,
      assignmentPaid: assignment.amountPaid,
      assignmentRemaining: assignment.remainingBalance,
    }))
  );

  const now = new Date();

  const upcomingSessions = allSessions
    .filter((s) => new Date(s.lessonDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
    );

  const nextSession = upcomingSessions[0] || null;

  const totalSpent = assignments.reduce(
    (sum, assignment) => sum + Number(assignment.accumulatedTotal),
    0
  );

  const totalConfirmedPaid = assignments.reduce(
    (sum, assignment) => sum + Number(assignment.amountPaid || 0),
    0
  );

  const remainingBalance = Math.max(totalSpent - totalConfirmedPaid, 0);

  const bookingStats = {
    pending: bookings.filter((b) => b.status.toLowerCase() === "pending")
      .length,
    accepted: bookings.filter((b) => b.status.toLowerCase() === "accepted")
      .length,
    declined: bookings.filter((b) => b.status.toLowerCase() === "declined")
      .length,
  };

  return (
    <StudentDashboardClient
      userName={session?.user?.name || "Student"}
      assignments={assignments}
      bookings={bookings}
      allSessions={allSessions}
      nextSession={nextSession}
      stats={{
        totalSpent,
        totalConfirmedPaid,
        remainingBalance,
        totalSessions: allSessions.length,
        upcomingCount: upcomingSessions.length,
        completedSessions: allSessions.filter(
          (s) => new Date(s.lessonDate) < now
        ).length,
        assignedTutors: assignments.length,
        uniqueSubjectsCount: new Set(bookings.map((b) => b.subject)).size,
        bookingStats,
      }}
    />
  );
}