import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

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
    include: {
      student: true,
      sessions: true,
    },
  });

  return NextResponse.json({ assignment });
}