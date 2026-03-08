import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentId = (session.user as any).id;

  const assignments = await prisma.studentTutorAssignment.findMany({
    where: { studentId },
    include: {
      tutor: {
        select: {
          id: true,
          name: true,
          email: true,
          hourlyRate: true,
        },
      },
      sessions: {
        orderBy: { lessonDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ assignments });
}