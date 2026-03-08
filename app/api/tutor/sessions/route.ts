import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

function timeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

async function recalculateAssignmentTotal(assignmentId: number) {
  const sessions = await prisma.teachingSession.findMany({
    where: { assignmentId },
    select: { amount: true },
  });

  const total = sessions.reduce((sum, s) => sum + Number(s.amount), 0);

  await prisma.studentTutorAssignment.update({
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

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  const durationHours = (endMinutes - startMinutes) / 60;
  const amount = durationHours * tutor.hourlyRate;

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

  const sessionRow = await prisma.teachingSession.create({
    data: {
      assignmentId: assignment.id,
      lessonDate: new Date(`${lessonDate}T00:00:00`),
      startTime,
      endTime,
      notes: notes || null,
      durationHours,
      amount,
    },
  });

  await recalculateAssignmentTotal(assignment.id);

  return NextResponse.json({ ok: true, session: sessionRow });
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

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  const durationHours = (endMinutes - startMinutes) / 60;
  const amount = durationHours * tutor.hourlyRate;

  const updated = await prisma.teachingSession.update({
    where: { id: sessionId },
    data: {
      lessonDate: new Date(`${lessonDate}T00:00:00`),
      startTime,
      endTime,
      notes: notes || null,
      durationHours,
      amount,
    },
  });

  await recalculateAssignmentTotal(existing.assignmentId);

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

  await prisma.teachingSession.delete({
    where: { id: sessionId },
  });

  await recalculateAssignmentTotal(existing.assignmentId);

  return NextResponse.json({ ok: true });
}