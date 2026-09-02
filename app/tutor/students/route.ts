import { recordActivity } from "@/lib/activity";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

async function getTutorForSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "TUTOR") return null;

  const userId = (session.user as any).id;

  return prisma.tutor.findFirst({
    where: {
      userId,
    },
  });
}

export async function GET() {
  const tutor = await getTutorForSession();

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const assignedStudents = await prisma.studentTutorAssignment.findMany({
    where: {
      tutorId: tutor.id,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    students,
    assignedStudents,
  });
}

export async function POST(request: Request) {
  const tutor = await getTutorForSession();

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 401 });
  }

  const body = await request.json();
  const studentId = String(body.studentId || "");

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  }

  const assignment = await prisma.$transaction(async tx => {
    const existing = await tx.studentTutorAssignment.findUnique({ where: { tutorId_studentId: { tutorId: tutor.id, studentId } },
      include: { student: { select: { id: true, name: true, email: true } }, sessions: true } });
    if (existing) return existing;
    const student = await tx.user.findUnique({ where: { id: studentId }, select: { role: true } });
    if (student?.role !== "STUDENT") throw new Error("Student not found");
    const row = await tx.studentTutorAssignment.create({ data: { tutorId: tutor.id, studentId },
      include: { student: { select: { id: true, name: true, email: true } }, sessions: true } });
    await recordActivity(tx, { actorId: tutor.userId, action: "ASSIGNMENT_CREATED", entityType: "Assignment", entityId: row.id,
      details: { tutorId: tutor.id, studentId } });
    return row;
  });

  return NextResponse.json({ assignment });
}