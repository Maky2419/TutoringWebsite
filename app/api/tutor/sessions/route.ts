import { recordActivity } from "@/lib/activity";
import type { Prisma } from "@prisma/client";
import { addCalendarDays, sessionTimeData } from "@/lib/sessionTime";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

async function recalculateAssignmentTotal(tx: Prisma.TransactionClient, assignmentId: number) {
  const sessions = await tx.teachingSession.findMany({
    where: { assignmentId },
    select: { amount: true, status: true },
  });

  const total = sessions.reduce((sum, s) => sum + (s.status === "cancelled" ? 0 : Number(s.amount)), 0);

  await tx.studentTutorAssignment.update({
    where: { id: assignmentId },
    data: {
      accumulatedTotal: total,
    },
  });
}

async function getTutorFromSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "TUTOR") {
    return null;
  }

  return prisma.tutor.findFirst({
    where: { userId: (session.user as any).id },
  });
}

export async function GET(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = String(searchParams.get("studentId") || "").trim();

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const assignment = await prisma.studentTutorAssignment.findUnique({
    where: {
      tutorId_studentId: {
        tutorId: tutor.id,
        studentId,
      },
    },
    include: {
      student: {
        select: { id: true, name: true, email: true },
      },
      sessions: {
        orderBy: { lessonDate: "asc" },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({
    assignment,
    hourlyRate: tutor.hourlyRate,
  });
}

export async function POST(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const studentId = String(body.studentId || "").trim();
  const lessonDate = String(body.lessonDate || "").trim();
  const startTime = String(body.startTime || "").trim();
  const endTime = String(body.endTime || "").trim();
  const notes = body.notes ? String(body.notes).trim() : "";

  if (!studentId || !lessonDate || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let timings: ReturnType<typeof sessionTimeData>[];
  try {
    const offsets = body.repeatFourWeeks === true ? [0, 7, 14, 21] : [0];
    timings = offsets.map(days => sessionTimeData({
      lessonDate: addCalendarDays(lessonDate, days), startTime, endTime,
      endDate: addCalendarDays(String(body.endDate || lessonDate), days),
      timeZone: String(body.timeZone || ""),
    }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid session time" }, { status: 400 });
  }

  const assignment = await prisma.studentTutorAssignment.findUnique({
    where: {
      tutorId_studentId: {
        tutorId: tutor.id,
        studentId,
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Please assign the student first" }, { status: 400 });
  }

  const sessions = await prisma.$transaction(async tx => {
    const rows = [];
    for (const timing of timings) {
        rows.push(await tx.teachingSession.create({ data: {
                assignmentId: assignment.id, ...timing, notes: notes || null,
                amount: timing.durationHours * tutor.hourlyRate,
            } }));
    }
    const total = await tx.teachingSession.aggregate({
        where: { assignmentId: assignment.id, status: { not: "cancelled" } },
        _sum: { amount: true },
    });
    await tx.studentTutorAssignment.update({ where: { id: assignment.id },
        data: { accumulatedTotal: total._sum.amount || 0 } });
    for (const row of rows) {
        await recordActivity(tx, { actorId: tutor.userId, action: "SESSION_CREATED", entityType: "TeachingSession", entityId: row.id,
            details: { studentId, tutorId: tutor.id, assignmentId: assignment.id, startsAt: row.startsAt, endsAt: row.endsAt,
                amount: Number(row.amount), currency: "USD" } });
    }
    return rows;
  });
  return NextResponse.json({ ok: true, session: sessions[0], sessions });
}

export async function PUT(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const sessionId = Number(body.sessionId);
  const lessonDate = String(body.lessonDate || "").trim();
  const startTime = String(body.startTime || "").trim();
  const endTime = String(body.endTime || "").trim();
  const notes = body.notes ? String(body.notes).trim() : "";

  if (!sessionId || !lessonDate || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
    include: {
      assignment: true,
    },
  });

  if (!existing || existing.assignment.tutorId !== tutor.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let timing: ReturnType<typeof sessionTimeData>;
  try {
    timing = sessionTimeData({ lessonDate, startTime, endTime,
      endDate: String(body.endDate || lessonDate), timeZone: String(body.timeZone || "") });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid session time" }, { status: 400 });
  }
  const { durationHours } = timing;
  const amount = durationHours * tutor.hourlyRate;

  const updated = await prisma.$transaction(async tx => {
    const updated = await tx.teachingSession.update({
        where: { id: sessionId },
        data: {
            ...timing,
            notes: notes || null,
            durationHours,
            amount,
        },
    });
    await recalculateAssignmentTotal(tx, existing.assignmentId);
    await recordActivity(tx, { actorId: tutor.userId, action: "SESSION_UPDATED", entityType: "TeachingSession", entityId: sessionId,
        details: { assignmentId: existing.assignmentId, studentId: existing.assignment.studentId,
            startsAt: updated.startsAt, endsAt: updated.endsAt, amount, currency: "USD" } });
    return updated;
  });

  return NextResponse.json({ ok: true, session: updated });
}

export async function DELETE(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const sessionId = Number(body.sessionId);

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const existing = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
    include: {
      assignment: true,
    },
  });

  if (!existing || existing.assignment.tutorId !== tutor.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await prisma.$transaction(async tx => {
    await tx.teachingSession.delete({
        where: { id: sessionId },
    });
    await recalculateAssignmentTotal(tx, existing.assignmentId);
    await recordActivity(tx, { actorId: tutor.userId, action: "SESSION_DELETED", entityType: "TeachingSession", entityId: sessionId,
        details: { assignmentId: existing.assignmentId, studentId: existing.assignment.studentId } });
  });

  return NextResponse.json({ ok: true });
}