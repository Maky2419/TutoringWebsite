import type { Prisma } from "@prisma/client";
import { recordActivity } from "./activity";

import { MAX_CANCELLATION_REASON } from "./cancellationShared";

export class CancellationError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export function cancellationReason(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new CancellationError("Please provide a reason for cancelling this session.", 400);
  }
  const reason = value.trim();
  if (reason.length > MAX_CANCELLATION_REASON) {
    throw new CancellationError(`The reason must be ${MAX_CANCELLATION_REASON} characters or fewer.`, 400);
  }
  return reason;
}

export async function requestCancellation(tx: Prisma.TransactionClient, studentId: string, sessionId: number, reason: string) {
  const row = await tx.teachingSession.findFirst({ where: { id: sessionId, assignment: { studentId } } });
  if (!row) throw new CancellationError("Session not found.", 404);
  if (row.status === "cancelled") throw new CancellationError("This session is already cancelled.", 409);
  if (row.cancellationStatus === "pending") throw new CancellationError("A cancellation request is already awaiting your tutor's decision.", 409);
  const changed = await tx.teachingSession.updateMany({
    where: { id: sessionId, status: { not: "cancelled" }, cancellationVersion: row.cancellationVersion },
    data: { cancellationStatus: "pending", cancellationReason: reason, cancellationRequestedAt: new Date(),
      cancellationReviewedAt: null, cancellationVersion: { increment: 1 } },
  });
  if (!changed.count) throw new CancellationError("This session changed. Refresh and try again.", 409);
  await recordActivity(tx, { actorId: studentId, action: "SESSION_CANCELLATION_REQUESTED", entityType: "TeachingSession", entityId: sessionId,
    details: { assignmentId: row.assignmentId, studentId, status: "pending" } });
}

export async function reviewCancellation(tx: Prisma.TransactionClient, tutorId: number, actorId: string, sessionId: number, decision: "accepted" | "declined", version: number) {
  const row = await tx.teachingSession.findFirst({ where: { id: sessionId, assignment: { tutorId } }, include: { assignment: true } });
  if (!row) throw new CancellationError("Session not found.", 404);
  if (row.status === "cancelled" || row.cancellationStatus !== "pending" || row.cancellationVersion !== version) {
    throw new CancellationError("This request has changed or has already been reviewed. Refresh to see its current status.", 409);
  }
  const changed = await tx.teachingSession.updateMany({
    where: { id: sessionId, status: { not: "cancelled" }, cancellationStatus: "pending", cancellationVersion: version },
    data: { cancellationStatus: decision, cancellationReviewedAt: new Date(), cancellationVersion: { increment: 1 },
      ...(decision === "accepted" ? { status: "cancelled" } : {}) },
  });
  if (!changed.count) throw new CancellationError("This request has already changed. Refresh and try again.", 409);
  if (decision === "accepted") {
    // An atomic decrement prevents two accepted requests from losing a balance update.
    await tx.studentTutorAssignment.update({ where: { id: row.assignmentId }, data: { accumulatedTotal: { decrement: row.amount } } });
  }
  const details = { assignmentId: row.assignmentId, studentId: row.assignment.studentId, tutorId, status: decision };
  await recordActivity(tx, { actorId, action: decision === "accepted" ? "SESSION_CANCELLATION_ACCEPTED" : "SESSION_CANCELLATION_DECLINED",
    entityType: "TeachingSession", entityId: sessionId, details });
  if (decision === "accepted") {
    await recordActivity(tx, { actorId, action: "SESSION_CANCELLED", entityType: "TeachingSession", entityId: sessionId, details });
  }
}
