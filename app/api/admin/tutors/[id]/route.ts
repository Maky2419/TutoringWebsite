import { getCurrentAdmin } from "@/lib/adminSecurity";
import { auditChange } from "@/lib/activity";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
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
            student: { select: { id: true, name: true, email: true } },
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
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  try {
    const tutorId = Number(params.id);

    if (!tutorId) {
      return NextResponse.json({ error: "Invalid tutor ID" }, { status: 400 });
    }

    await auditChange({ actorId: admin.id, action: "TUTOR_DELETED", entityType: "Tutor", entityId: tutorId },
      tx => tx.tutor.delete({ where: { id: tutorId } }));

    return NextResponse.json({ message: "Tutor deleted successfully" });
  } catch (error) {
    console.error("DELETE tutor error:", error);
    return NextResponse.json(
      { error: "Failed to delete tutor" },
      { status: 500 }
    );
  }
}