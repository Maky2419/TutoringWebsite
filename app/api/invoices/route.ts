import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildInvoice } from "@/lib/generateInvoice";
import { recordActivity } from "@/lib/activity";
import { BASE_CURRENCY, CURRENCY_CODES, type CurrencyCode } from "@/lib/currency";
import { getUsdExchangeRates } from "@/lib/exchangeRates";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || !["STUDENT", "TUTOR"].includes(user.role || "")) {
    return NextResponse.json({ error: "Sign in as a student or tutor." }, { status: 401 });
  }
  const body = await req.json();
  const assignmentId = Number(body.assignmentId);
  const requestedCurrency = String(body.currency || BASE_CURRENCY).toUpperCase();
  const currency = CURRENCY_CODES.includes(requestedCurrency as CurrencyCode)
    ? requestedCurrency as CurrencyCode
    : BASE_CURRENCY;
  if (!Number.isSafeInteger(assignmentId) || assignmentId <= 0) return NextResponse.json({ error: "Invalid assignment." }, { status: 400 });
  const exchangeRates = await getUsdExchangeRates();
  const conversionRate = exchangeRates[currency] || 1;
  const result = await prisma.$transaction(async tx => {
    const assignment = await tx.studentTutorAssignment.findFirst({ where: { id: assignmentId,
      ...(user.role === "STUDENT" ? { studentId: user.id } : { tutor: { userId: user.id } }),
    }, include: { student: { select: { name: true, email: true } }, tutor: true, sessions: true } });
    if (!assignment) return { status: 404 as const };
    const payments = await tx.tutorPaymentConfirmation.aggregate({
      where: { tutorId: assignment.tutorId, studentId: assignment.studentId, confirmed: true }, _sum: { amountPaid: true },
    });
    const pdf = buildInvoice({ studentName: assignment.student.name || "Student", tutorName: assignment.tutor.name,
      subject: assignment.tutor.category || "Tutoring", amountPaid: Number(payments._sum.amountPaid || 0),
      currency, conversionRate,
      sessions: assignment.sessions.map(row => ({ ...row, amount: Number(row.amount), durationHours: Number(row.durationHours),
        hourlyRateApplied: row.hourlyRateApplied === null ? null : Number(row.hourlyRateApplied) })),
    });
    if (!pdf) return { status: 409 as const };
    await recordActivity(tx, { actorId: user.id, action: "INVOICE_GENERATED", entityType: "Assignment", entityId: assignmentId,
      details: { assignmentId, studentId: assignment.studentId, tutorId: assignment.tutorId,
        sessionCount: pdf.sessionCount, balanceDue: pdf.balanceDue, currency, conversionRate, source: user.role } });
    return { status: 200 as const, pdf };
  }, { timeout: 15000 });
  if (result.status === 404) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  if (result.status === 409) return NextResponse.json({ error: "There are no unpaid sessions to invoice. No payment is due." }, { status: 409 });
  return new NextResponse(result.pdf.bytes, { headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store",
    "Content-Disposition": `attachment; filename="invoice-${assignmentId}-${currency}.pdf"` } });
}
