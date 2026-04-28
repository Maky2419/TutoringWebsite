import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedFrequencies = ["PER_LESSON", "BI_WEEKLY", "MONTHLY"] as const;

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "TUTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const paymentFrequency = String(body.paymentFrequency || "");
  const stripeConnectAccountId = String(body.stripeConnectAccountId || "").trim();

  if (!allowedFrequencies.includes(paymentFrequency as any)) {
    return NextResponse.json({ error: "Invalid payment frequency." }, { status: 400 });
  }

  const tutor = await prisma.tutor.findFirst({
    where: {
      OR: [
        { userId: (session.user as any).id },
        { email: session.user.email || "" },
      ],
    },
  });

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found." }, { status: 404 });
  }

  const updatedTutor = await prisma.tutor.update({
    where: { id: tutor.id },
    data: {
      paymentFrequency: paymentFrequency as any,
      stripeConnectAccountId: stripeConnectAccountId || null,
    },
  });

  return NextResponse.json({
    ok: true,
    tutor: {
      paymentFrequency: updatedTutor.paymentFrequency,
      stripeConnectAccountId: updatedTutor.stripeConnectAccountId,
    },
  });
}
