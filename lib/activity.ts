import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { ActivityAction } from "./activityEvents";

export type ActivityActor = { id?: string | null; name?: string | null; email?: string | null; role?: string | null };
type Details = Record<string, unknown>;
export type ActivityInput = {
  actorId?: string | null;
  actor?: ActivityActor;
  action: ActivityAction;
  entityType: string;
  entityId?: string | number | null;
  details?: Details;
};
// Explicit metadata allowlist. Never copy a request, form, user record, password,
// token, free-text review, biography, session note or payment note into this log.
const allowed = new Set(["studentId", "tutorId", "assignmentId", "sessionId", "sessionCount", "sessionIds",
  "amount", "amountPaid", "balanceDue", "currency", "status", "provider", "startsAt", "endsAt", "fields", "source"]);
const fieldNames = new Set(["name", "email", "role", "subjects", "education", "bio", "category", "curriculum", "hourlyRate",
  "studentName", "studentEmail", "subject", "preferredTimes", "message", "status", "tutorId", "studentId", "accumulatedTotal",
  "lessonDate", "startTime", "endTime", "notes", "amount", "amountPaid", "confirmed", "note", "rating", "student", "comment"]);
export function safeActivityDetails(details: Details = {}): Prisma.InputJsonObject {
  const result: Record<string, Prisma.InputJsonValue> = {};
  for (const [key, value] of Object.entries(details)) {
    if (!allowed.has(key)) continue;
    if (key === "fields") {
      result[key] = Array.isArray(value) ? value.filter(v => typeof v === "string" && fieldNames.has(v)) : [];
    } else if (Array.isArray(value)) {
      if (key === "sessionIds") result[key] = value.filter(v => Number.isSafeInteger(v)).slice(0, 100);
    } else if (typeof value === "number" && Number.isFinite(value)) result[key] = value;
    else if (typeof value === "string") result[key] = value.slice(0, 191);
    else if (value instanceof Date) result[key] = value.toISOString();
  }
  return result;
}
export async function activityActor(tx: Prisma.TransactionClient, id?: string | null): Promise<ActivityActor> {
  if (!id) return { name: "System", role: "SYSTEM" };
  const user = await tx.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } });
  return user || { id, name: "Deleted user", role: "UNKNOWN" };
}
export async function recordActivity(tx: Prisma.TransactionClient, input: ActivityInput) {
  const actor = input.actor || await activityActor(tx, input.actorId);
  return tx.activityLog.create({ data: {
    createdAt: new Date(),
    actorId: actor.id || null, actorName: (actor.name || "Unnamed user").slice(0, 191),
    actorEmail: actor.email?.slice(0, 191) || null, actorRole: (actor.role || "UNKNOWN").slice(0, 30),
    action: input.action, entityType: input.entityType.slice(0, 50),
    entityId: input.entityId == null ? null : String(input.entityId).slice(0, 191),
    details: safeActivityDetails(input.details),
  } });
}
// Database change and audit entry either commit together or both roll back.
export async function auditChange<T>(input: ActivityInput, change: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async tx => {
    const actor = input.actor || await activityActor(tx, input.actorId);
    const result = await change(tx);
    const resultId = result && typeof result === "object" && "id" in result ? String(result.id) : null;
    await recordActivity(tx, { ...input, actor, entityId: input.entityId ?? resultId });
    return result;
  });
}
