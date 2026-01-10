import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  // Dev/admin convenience: list bookings (add auth later!)
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const body = await req.json();

  const booking = await prisma.booking.create({
    data: {
      studentName: String(body.studentName || ""),
      studentEmail: String(body.studentEmail || ""),
      subject: String(body.subject || ""),
      preferredTimes: String(body.preferredTimes || ""),
      message: body.message ? String(body.message) : null,
      status: "pending"
    }
  });

  return NextResponse.json(booking, { status: 201 });
}
