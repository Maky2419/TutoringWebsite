import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tutorId = Number(params.id);

    if (!tutorId) {
      return NextResponse.json({ error: "Invalid tutor ID" }, { status: 400 });
    }

    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        assignedStudents: {
          include: {
            student: true,
            sessions: true,
          },
        },
        bookings: true,
      },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    return NextResponse.json(tutor);
  } catch (error) {
    console.error("GET tutor error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tutorId = Number(params.id);

    if (!tutorId) {
      return NextResponse.json({ error: "Invalid tutor ID" }, { status: 400 });
    }

    await prisma.tutor.delete({
      where: { id: tutorId },
    });

    return NextResponse.json({ message: "Tutor deleted successfully" });
  } catch (error) {
    console.error("DELETE tutor error:", error);
    return NextResponse.json(
      { error: "Failed to delete tutor" },
      { status: 500 }
    );
  }
}