import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentAdmin } from "@/lib/adminSecurity";
import { prisma } from "@/lib/prisma";
import { ACTIVITY_LABELS } from "@/lib/activityEvents";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const params = new URL(req.url).searchParams;
  const action = params.get("action") || "";
  const query = (params.get("q") || "").trim().slice(0, 191);
  const cursorId = params.get("beforeId");
  const cursorTime = params.get("beforeTime");
  if (action && !Object.prototype.hasOwnProperty.call(ACTIVITY_LABELS, action)) {
    return NextResponse.json({ error: "Invalid event type." }, { status: 400 });
  }
  const where: Prisma.ActivityLogWhereInput = {};
  if (action) where.action = action;
  if (query) where.OR = [{ actorName: { contains: query } }, { actorEmail: { contains: query } },
    { actorId: { equals: query } }, { entityId: { equals: query } }];
  if (cursorId || cursorTime) {
    const id = Number(cursorId), time = new Date(cursorTime || "");
    if (!Number.isSafeInteger(id) || id <= 0 || !Number.isFinite(+time)) {
      return NextResponse.json({ error: "Invalid page cursor." }, { status: 400 });
    }
    where.AND = [{ OR: [{ createdAt: { lt: time } }, { createdAt: time, id: { lt: id } }] }];
  }
  const rows = await prisma.activityLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 101 });
  const events = rows.slice(0, 100);
  const last = events[events.length - 1];
  return NextResponse.json({ events, nextCursor: rows.length > 100 && last ? { id: last.id, time: last.createdAt } : null },
    { headers: { "Cache-Control": "no-store" } });
}
