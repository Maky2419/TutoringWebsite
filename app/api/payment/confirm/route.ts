import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payment = await prisma.tutorPaymentConfirmation.create({
      data: {
        tutorId: body.tutorId,
        studentId: body.studentId,
        amountPaid: body.amountPaid,
        confirmed: true,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}