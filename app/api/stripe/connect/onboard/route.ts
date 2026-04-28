import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "TUTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const tutor = await prisma.tutor.findUnique({
      where: { userId },
    });

    if (!tutor) {
      return NextResponse.json(
        { error: "Tutor profile not found." },
        { status: 404 }
      );
    }

    let accountId = tutor.stripeConnectAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: tutor.email,
        country: "CA",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
      });

      accountId = account.id;

      await prisma.tutor.update({
        where: { id: tutor.id },
        data: {
          stripeConnectAccountId: accountId,
        },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/tutor/account`,
      return_url: `${baseUrl}/tutor/account?stripe=connected`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe onboarding error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Could not start Stripe onboarding. Check your Stripe Connect setup.",
      },
      { status: 500 }
    );
  }
}