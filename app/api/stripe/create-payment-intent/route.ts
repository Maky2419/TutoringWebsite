import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const PLATFORM_FEE_PERCENT = 15;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const assignmentId = Number(body.assignmentId);
  const hours = Number(body.hours);

  if (!assignmentId || !hours || hours <= 0) {
    return NextResponse.json({ error: "Choose a valid tutor and number of hours." }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const assignment = await prisma.studentTutorAssignment.findFirst({
    where: { id: assignmentId, studentId: userId },
    include: { tutor: true, student: true },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  if (!assignment.tutor.stripeConnectAccountId) {
    return NextResponse.json({
      error: "This tutor has not connected a Stripe payout account yet.",
    }, { status: 400 });
  }

  let stripeCustomerId = assignment.student.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: assignment.student.email || undefined,
      name: assignment.student.name || undefined,
      metadata: { userId },
    });

    stripeCustomerId = customer.id;

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    });
  }

  const amountCents = Math.round(hours * assignment.tutor.hourlyRate * 100);
  const platformFeeCents = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));

  const payment = await prisma.tuitionPayment.create({
    data: {
      studentId: userId,
      tutorId: assignment.tutorId,
      assignmentId: assignment.id,
      hoursPurchased: hours,
      amountCents,
      platformFeeCents,
      tutorAmountCents: amountCents - platformFeeCents,
      status: "PENDING",
    },
  });

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "cad",
    customer: stripeCustomerId,
    automatic_payment_methods: { enabled: true },
    application_fee_amount: platformFeeCents,
    transfer_data: {
      destination: assignment.tutor.stripeConnectAccountId,
    },
    metadata: {
      tuitionPaymentId: String(payment.id),
      assignmentId: String(assignment.id),
      studentId: userId,
      tutorId: String(assignment.tutorId),
      hoursPurchased: String(hours),
    },
  });

  await prisma.tuitionPayment.update({
    where: { id: payment.id },
    data: { stripePaymentIntentId: intent.id },
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}
