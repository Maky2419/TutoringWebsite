import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "TUTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { tutorId, studentId, teachingSessionId, amountPaid, note } = body;

    if (!tutorId || !studentId || !amountPaid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const confirmation = await prisma.tutorPaymentConfirmation.create({
      data: {
        tutorId: Number(tutorId),
        studentId: String(studentId),
        teachingSessionId: teachingSessionId ? Number(teachingSessionId) : null,
        amountPaid: Number(amountPaid),
        confirmed: true,
        note: note || null,
      },
    });

    return NextResponse.json(confirmation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save payment confirmation" },
      { status: 500 }
    );
  }
}