import { recordActivity } from "@/lib/activity";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

import { prisma } from "../../../../lib/prisma";

async function getTutorFromSession() {
const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TUTOR") {
    return null;
  }

  const tutor = await prisma.tutor.findFirst({
    where: { userId: (session.user as any).id },
  });

  return tutor;
}

export async function GET() {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [students, assignedStudents] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.studentTutorAssignment.findMany({
      where: { tutorId: tutor.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ students, assignedStudents });
}

export async function POST(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const studentId = String(body.studentId || "").trim();

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  await prisma.$transaction(async tx => {
    const existing = await tx.studentTutorAssignment.findUnique({ where: { tutorId_studentId: { tutorId: tutor.id, studentId } } });
    if (existing) return;
    const student = await tx.user.findUnique({ where: { id: studentId }, select: { role: true } });
    if (student?.role !== "STUDENT") throw new Error("Student not found");
    const assignment = await tx.studentTutorAssignment.create({ data: { tutorId: tutor.id, studentId } });
    await recordActivity(tx, { actorId: tutor.userId, action: "ASSIGNMENT_CREATED", entityType: "Assignment", entityId: assignment.id,
      details: { tutorId: tutor.id, studentId } });
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const studentId = String(body.studentId || "").trim();
  const rawRate = body.customHourlyRate;
  const customHourlyRate = rawRate === null || rawRate === "" ? null : Number(rawRate);

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  if (customHourlyRate !== null && (!Number.isFinite(customHourlyRate) || customHourlyRate <= 0 || customHourlyRate > 100000)) {
    return NextResponse.json({ error: "Enter a valid hourly rate greater than 0." }, { status: 400 });
  }

  const assignment = await prisma.$transaction(async tx => {
    const existing = await tx.studentTutorAssignment.findUnique({
      where: { tutorId_studentId: { tutorId: tutor.id, studentId } },
    });
    if (!existing) return null;

    const updated = await tx.studentTutorAssignment.update({
      where: { id: existing.id },
      data: { customHourlyRate },
    });
    await recordActivity(tx, {
      actorId: tutor.userId,
      action: "ASSIGNMENT_UPDATED",
      entityType: "Assignment",
      entityId: existing.id,
      details: {
        tutorId: tutor.id,
        studentId,
        customHourlyRate,
        effectiveRate: customHourlyRate ?? tutor.hourlyRate,
        appliesTo: "future sessions",
        currency: "USD",
      },
    });
    return updated;
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    customHourlyRate: assignment.customHourlyRate,
    effectiveHourlyRate: Number(assignment.customHourlyRate ?? tutor.hourlyRate),
  });
}

export async function DELETE(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const studentId = String(body.studentId || "").trim();

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  await prisma.$transaction(async tx => {
    const assignment = await tx.studentTutorAssignment.findUnique({ where: { tutorId_studentId: { tutorId: tutor.id, studentId } } });
    if (!assignment) return;
    await tx.studentTutorAssignment.delete({ where: { id: assignment.id } });
    await recordActivity(tx, { actorId: tutor.userId, action: "ASSIGNMENT_DELETED", entityType: "Assignment", entityId: assignment.id,
      details: { tutorId: tutor.id, studentId } });
  });

  return NextResponse.json({ ok: true });
}
