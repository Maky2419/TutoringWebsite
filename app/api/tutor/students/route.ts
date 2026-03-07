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

  await prisma.studentTutorAssignment.upsert({
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

  return NextResponse.json({ ok: true });
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

  await prisma.studentTutorAssignment.deleteMany({
    where: {
      tutorId: tutor.id,
      studentId,
    },
  });

  return NextResponse.json({ ok: true });
}