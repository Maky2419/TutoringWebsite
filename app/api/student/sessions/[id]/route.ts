import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const sessionId = Number(params.id);

  if (!sessionId) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  const teachingSession = await prisma.teachingSession.findFirst({
    where: {
      id: sessionId,
      assignment: {
        studentId: userId,
      },
    },
  });

  if (!teachingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await prisma.teachingSession.update({
    where: { id: sessionId },
    data: {
      status: "cancelled",
    },
  });

  return NextResponse.json({ success: true });
}