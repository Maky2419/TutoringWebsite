import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookingId = Number(params.id);
  const body = await request.json();
  const status = String(body.status || "").toLowerCase();

  if (!bookingId) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  if (!["accepted", "declined", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const existingBooking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [{ studentUserId: userId }, { studentEmail: session?.user?.email }],
    },
  });

  if (!existingBooking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { tutor: true },
  });

  return NextResponse.json({ booking: updatedBooking });
}