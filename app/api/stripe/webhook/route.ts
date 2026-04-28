import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const tuitionPaymentId = Number(paymentIntent.metadata?.tuitionPaymentId);

    if (tuitionPaymentId) {
      const existing = await prisma.tuitionPayment.findUnique({
        where: { id: tuitionPaymentId },
      });

      if (existing && existing.status !== "SUCCEEDED") {
        await prisma.$transaction([
          prisma.tuitionPayment.update({
            where: { id: tuitionPaymentId },
            data: { status: "SUCCEEDED", paidAt: new Date() },
          }),
          prisma.studentTutorAssignment.update({
            where: { id: existing.assignmentId },
            data: {
              purchasedHours: {
                increment: existing.hoursPurchased,
              },
            },
          }),
        ]);
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const tuitionPaymentId = Number(paymentIntent.metadata?.tuitionPaymentId);

    if (tuitionPaymentId) {
      await prisma.tuitionPayment.update({
        where: { id: tuitionPaymentId },
        data: { status: "FAILED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
