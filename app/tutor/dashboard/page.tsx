import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TutorDashboardClient from "@/components/TutorDashboardClient";

export default async function TutorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "TUTOR") redirect("/dashboard");

  const userId = (session.user as any).id;

  const tutor = await prisma.tutor.findFirst({
    where: {
      OR: [{ userId }, { email: session?.user?.email || "" }],
    },
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
      paymentConfirmations: {
        orderBy: { createdAt: "desc" },
        include: {
          student: true,
          teachingSession: true,
        },
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

  const paymentConfirmations = tutor.paymentConfirmations.map((p) => ({
    id: p.id,
    studentId: p.studentId,
    studentName: p.student.name || "Student",
    studentEmail: p.student.email || "",
    teachingSessionId: p.teachingSessionId,
    amountPaid: Number(p.amountPaid),
    confirmed: p.confirmed,
    note: p.note,
    createdAt: p.createdAt.toISOString(),
  }));

  const assignedStudents = tutor.assignedStudents.map((assignment) => {
    const studentPayments = paymentConfirmations.filter(
      (payment) => payment.studentId === assignment.studentId
    );

    const studentTotalPaid = studentPayments.reduce(
      (sum, payment) => sum + Number(payment.amountPaid || 0),
      0
    );

    return {
      id: assignment.id,
      studentId: assignment.studentId,
      accumulatedTotal: Number(assignment.accumulatedTotal),
      amountPaid: studentTotalPaid,
      amountRemaining: Math.max(
        Number(assignment.accumulatedTotal) - studentTotalPaid,
        0
      ),
      student: {
        id: assignment.student.id,
        name: assignment.student.name,
        email: assignment.student.email,
      },
      sessions: assignment.sessions.map((s) => {
        const sessionPayments = paymentConfirmations.filter(
          (payment) => payment.teachingSessionId === s.id
        );

        const sessionAmountPaid = sessionPayments.reduce(
          (sum, payment) => sum + Number(payment.amountPaid || 0),
          0
        );

        return {
          id: s.id,
          lessonDate: s.lessonDate.toISOString(),
          startTime: s.startTime,
          endTime: s.endTime,
          notes: s.notes,
          durationHours: Number(s.durationHours),
          amount: Number(s.amount),
          status: s.status,
          amountPaid: sessionAmountPaid,
          paymentConfirmed: sessionAmountPaid >= Number(s.amount),
        };
      }),
    };
  });

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
      studentId: assignment.student.id,
      studentName: assignment.student.name,
      studentEmail: assignment.student.email,
    }))
  );

  const now = new Date();

  const activeSessions = allSessions.filter((s) => s.status !== "cancelled");

  const upcomingSessions = activeSessions
    .filter((s) => new Date(s.lessonDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
    );

  const todayStr = now.toISOString().split("T")[0];

  const todaysSessions = activeSessions.filter(
    (s) => new Date(s.lessonDate).toISOString().split("T")[0] === todayStr
  ).length;

  const totalEarnings = activeSessions.reduce(
    (sum, session) => sum + Number(session.amount || 0),
    0
  );

  const totalConfirmedPaid = paymentConfirmations.reduce(
    (sum, payment) => sum + Number(payment.amountPaid || 0),
    0
  );

  const pendingPaymentAmount = Math.max(totalEarnings - totalConfirmedPaid, 0);

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
      userName={session?.user?.name || tutor.name}
      assignedStudents={assignedStudents}
      bookings={bookings}
      allSessions={allSessions}
      upcomingSessions={upcomingSessions}
      calendarSessions={allSessions}
      paymentConfirmations={paymentConfirmations}
      stats={{
        todaysSessions,
        totalEarnings,
        totalConfirmedPaid,
        pendingPaymentAmount,
        totalStudents: assignedStudents.length,
        totalSessions: activeSessions.length,
        pendingBookings,
      }}
    />
  );
}