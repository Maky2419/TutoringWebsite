import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentAdmin } from "@/lib/adminSecurity";
import { prisma } from "@/lib/prisma";
import { ACTIVITY_LABELS } from "@/lib/activityEvents";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
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
    if (!prisma.activityLog || typeof prisma.activityLog.findMany !== "function") {
      return failure("Activity History setup is incomplete. Regenerate Prisma Client and restart the server.", "ACTIVITY_CLIENT_OUTDATED", 503);
    }
    const rows = await prisma.activityLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 101 });
    const events = rows.slice(0, 100);
    const last = events[events.length - 1];
    return NextResponse.json({ events, nextCursor: rows.length > 100 && last ? { id: last.id, time: last.createdAt } : null },
      { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN";
    // Keep raw database exceptions and connection details out of browser responses.
    console.error("ACTIVITY_HISTORY_LOAD_FAILED", { code: /^P\d{4}$/.test(code) ? code : "UNKNOWN" });
    if (code === "P2021" || code === "P2022") {
      return failure("Activity History setup is incomplete. Apply the database update, regenerate Prisma Client and restart the server.", "ACTIVITY_SCHEMA_OUTDATED", 503);
    }
    if (["P1000", "P1001", "P1002", "P1003", "P1008", "P1017", "P2024"].includes(code)) {
      return failure("Activity History cannot connect to its database. Check the server database connection and try again.", "ACTIVITY_DATABASE_UNAVAILABLE", 503);
    }
    return failure("Activity History could not load. Try Refresh latest. If it continues, check the server logs for ACTIVITY_HISTORY_LOAD_FAILED.", "ACTIVITY_LOAD_FAILED", 500);
  }
}

function failure(error: string, code: string, status: number) {
  return NextResponse.json({ error, code }, { status, headers: { "Cache-Control": "no-store" } });
}
