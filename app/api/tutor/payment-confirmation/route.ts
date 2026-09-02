import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/activity";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TUTOR") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const actorId = (session.user as any).id;
  const body = await req.json();
  const amountPaid = Number(body.amountPaid);
  const studentId = String(body.studentId || "").trim();
  const teachingSessionId = body.teachingSessionId ? Number(body.teachingSessionId) : null;
  if (!studentId || !Number.isFinite(amountPaid) || amountPaid <= 0 || amountPaid > 99999999.99 ||
      (teachingSessionId !== null && (!Number.isSafeInteger(teachingSessionId) || teachingSessionId <= 0))) {
    return NextResponse.json({ error: "Provide a student and a valid positive payment amount." }, { status: 400 });
  }
  // Identity comes from the authenticated tutor, never a caller-supplied tutor ID.
  const tutor = await prisma.tutor.findUnique({ where: { userId: actorId } });
  if (!tutor || (body.tutorId != null && Number(body.tutorId) !== tutor.id)) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 403 });
  }
  const confirmation = await prisma.$transaction(async tx => {
    const assignment = await tx.studentTutorAssignment.findUnique({ where: { tutorId_studentId: { tutorId: tutor.id, studentId } } });
    if (!assignment) return null;
    if (teachingSessionId !== null && !(await tx.teachingSession.findFirst({ where: { id: teachingSessionId, assignmentId: assignment.id } }))) return null;
    const payment = await tx.tutorPaymentConfirmation.create({ data: {
      tutorId: tutor.id, studentId, teachingSessionId, amountPaid, confirmed: true, note: body.note ? String(body.note) : null,
    } });
    await recordActivity(tx, { actorId, action: "PAYMENT_CONFIRMED", entityType: "Payment", entityId: payment.id,
      details: { tutorId: tutor.id, studentId, sessionId: teachingSessionId, amountPaid: Number(payment.amountPaid), currency: "USD" } });
    return payment;
  });
  return confirmation ? NextResponse.json(confirmation) : NextResponse.json({ error: "Assignment or session not found for this tutor." }, { status: 404 });
}
