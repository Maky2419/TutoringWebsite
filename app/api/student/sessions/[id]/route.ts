import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CancellationError, cancellationReason, requestCancellation } from "@/lib/cancellation";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessionId = Number(params.id);
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  try {
    const body = await request.json().catch(() => null);
    const reason = cancellationReason(body?.reason);
    await prisma.$transaction(tx => requestCancellation(tx, (session.user as any).id, sessionId, reason));
    return NextResponse.json({ success: true, cancellationStatus: "pending" });
  } catch (error) {
    if (error instanceof CancellationError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Cancellation request failed", error);
    return NextResponse.json({ error: "Unable to submit the cancellation request. Please try again." }, { status: 500 });
  }
}
// Older clients must also supply a reason and go through tutor approval.
export { PATCH as DELETE };
