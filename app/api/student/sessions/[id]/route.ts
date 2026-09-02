import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/activity";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const sessionId = Number(params.id);
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  const found = await prisma.$transaction(async tx => {
    const row = await tx.teachingSession.findFirst({ where: { id: sessionId, assignment: { studentId: userId } } });
    if (!row) return false;
    // A retry or simultaneous click must not create another cancellation event.
    const changed = await tx.teachingSession.updateMany({
      where: { id: sessionId, status: { not: "cancelled" } }, data: { status: "cancelled" },
    });
    if (changed.count) {
      const total = await tx.teachingSession.aggregate({ where: { assignmentId: row.assignmentId, status: { not: "cancelled" } }, _sum: { amount: true } });
      await tx.studentTutorAssignment.update({ where: { id: row.assignmentId }, data: { accumulatedTotal: total._sum.amount || 0 } });
      await recordActivity(tx, { actorId: userId, action: "SESSION_CANCELLED", entityType: "TeachingSession", entityId: sessionId,
        details: { assignmentId: row.assignmentId, studentId: userId, startsAt: row.startsAt, endsAt: row.endsAt } });
    }
    return true;
  });
  return found ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Session not found" }, { status: 404 });
}
export { PATCH as DELETE };
