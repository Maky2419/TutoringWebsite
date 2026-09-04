import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CancellationError, deleteReviewedCancellation, reviewCancellation } from "@/lib/cancellation";
import { emailStudentCancellationDecision } from "@/lib/cancellationEmails";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TUTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessionId = Number(params.id);
  const body = await request.json().catch(() => null);
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0 || !["accepted", "declined"].includes(body?.decision)
      || !Number.isSafeInteger(body?.version) || body.version < 1) {
    return NextResponse.json({ error: "A valid session, decision, and request version are required." }, { status: 400 });
  }
  try {
    const actorId = (session.user as any).id;
    const tutor = await prisma.tutor.findUnique({ where: { userId: actorId } });
    if (!tutor) return NextResponse.json({ error: "Tutor profile not found." }, { status: 404 });
    const reviewedSession = await prisma.$transaction(async tx => {
      await reviewCancellation(tx, tutor.id, actorId, sessionId, body.decision, body.version);
      return tx.teachingSession.findUniqueOrThrow({
        where: { id: sessionId },
        include: { assignment: { include: { student: true, tutor: true } } },
      });
    });
    let emailSent = false;
    try {
      await emailStudentCancellationDecision(reviewedSession, body.decision);
      emailSent = true;
    } catch (emailError) {
      console.error("Cancellation decision saved, but student email failed", { sessionId, emailError });
    }
    return NextResponse.json({ success: true, cancellationStatus: body.decision, emailSent });
  } catch (error) {
    if (error instanceof CancellationError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Cancellation review failed", error);
    return NextResponse.json({ error: "Unable to review the cancellation request. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TUTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessionId = Number(params.id);
  const body = await request.json().catch(() => null);
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0 || !Number.isSafeInteger(body?.version) || body.version < 1) {
    return NextResponse.json({ error: "A valid session and request version are required." }, { status: 400 });
  }
  try {
    const actorId = (session.user as any).id;
    const tutor = await prisma.tutor.findUnique({ where: { userId: actorId } });
    if (!tutor) return NextResponse.json({ error: "Tutor profile not found." }, { status: 404 });
    await prisma.$transaction(tx => deleteReviewedCancellation(tx, tutor.id, actorId, sessionId, body.version));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof CancellationError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Cancellation request deletion failed", error);
    return NextResponse.json({ error: "Unable to delete the cancellation request. Please try again." }, { status: 500 });
  }
}
