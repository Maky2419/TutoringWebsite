import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

function getDurationHours(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  if (end <= start) return 0;

  return Number(((end - start) / 60).toFixed(2));
}

async function getTutorForSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  const userId = (session.user as any).id;

  return prisma.tutor.findFirst({
    where: {
      OR: [{ userId }, { email: session?.user?.email || "" }],
    },
  });
}

async function recalculateAssignmentTotal(assignmentId: number) {
  const result = await prisma.teachingSession.aggregate({
    where: { assignmentId },
    _sum: {
      amount: true,
    },
  });

  await prisma.studentTutorAssignment.update({
    where: { id: assignmentId },
    data: {
      accumulatedTotal: result._sum.amount || 0,
    },
  });
}

export async function GET(request: Request) {
  const tutor = await getTutorForSession();

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  }

  const assignment = await prisma.studentTutorAssignment.findUnique({
    where: {
      tutorId_studentId: {
        tutorId: tutor.id,
        studentId,
      },
    },
    include: {
      student: true,
      sessions: {
        orderBy: {
          lessonDate: "asc",
        },
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

export async function POST(request: Request) {
  const tutor = await getTutorForSession();

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 401 });
  }

  const body = await request.json();

  const studentId = String(body.studentId || "");
  const lessonDate = String(body.lessonDate || "");
  const startTime = String(body.startTime || "");
  const endTime = String(body.endTime || "");
  const notes = body.notes ? String(body.notes) : null;

  if (!studentId || !lessonDate || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Missing required session fields" },
      { status: 400 }
    );
  }

  const durationHours = getDurationHours(startTime, endTime);

  if (durationHours <= 0) {
    return NextResponse.json(
      { error: "End time must be after start time" },
      { status: 400 }
    );
  }

  const assignment = await prisma.studentTutorAssignment.upsert({
    where: {
      tutorId_studentId: {
        tutorId: tutor.id,
        studentId,
      },
    },
    update: {},
    create: {
      tutorId: tutor.id,
      studentId,
    },
  });

  const amount = Number((durationHours * tutor.hourlyRate).toFixed(2));

  const session = await prisma.teachingSession.create({
    data: {
      assignmentId: assignment.id,
      lessonDate: new Date(`${lessonDate}T00:00:00.000Z`),
      startTime,
      endTime,
      notes,
      durationHours,
      amount,
    },
  });

  await recalculateAssignmentTotal(assignment.id);

  return NextResponse.json({ session }, { status: 201 });
}

export async function PUT(request: Request) {
  const tutor = await getTutorForSession();

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 401 });
  }

  const body = await request.json();

  const sessionId = Number(body.sessionId);
  const studentId = String(body.studentId || "");
  const lessonDate = String(body.lessonDate || "");
  const startTime = String(body.startTime || "");
  const endTime = String(body.endTime || "");
  const notes = body.notes ? String(body.notes) : null;

  if (!sessionId || !studentId || !lessonDate || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Missing required session fields" },
      { status: 400 }
    );
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
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const durationHours = getDurationHours(startTime, endTime);

  if (durationHours <= 0) {
    return NextResponse.json(
      { error: "End time must be after start time" },
      { status: 400 }
    );
  }

  const amount = Number((durationHours * tutor.hourlyRate).toFixed(2));

  const updatedSession = await prisma.teachingSession.update({
    where: { id: sessionId },
    data: {
      lessonDate: new Date(`${lessonDate}T00:00:00.000Z`),
      startTime,
      endTime,
      notes,
      durationHours,
      amount,
    },
  });

  await recalculateAssignmentTotal(assignment.id);

  return NextResponse.json({ session: updatedSession });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const sessionId = Number(body.sessionId);

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const existing = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await prisma.teachingSession.delete({
    where: { id: sessionId },
  });

  await recalculateAssignmentTotal(existing.assignmentId);

  return NextResponse.json({ success: true });
}