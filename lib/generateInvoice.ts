import { DUBAI_TIME_ZONE, sessionInstants, zonedParts } from "./sessionTime";
import jsPDF from "jspdf";

type InvoiceSession = {
  id?: number;
  status?: string;
  lessonDate: Date | string;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  sourceTimeZone?: string | null;
  startTime: string;
  endTime: string;
  notes: string | null;
  amount: string | number;
  durationHours: string | number;
};

type InvoiceData = {
  studentName: string;
  tutorName: string;
  subject: string;
  sessions: InvoiceSession[];
  amountPaid?: number;
};

/** Apply confirmed payments to active sessions oldest first, in integer cents.
 * This is an invoice allocation only; it does not alter recorded sessions/payments.
 */
export function getUnpaidInvoiceSessions(sessions: InvoiceSession[], amountPaid = 0) {
  const toCents = (value: number | string) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Invoice amounts must be valid non-negative numbers.");
    }
    return Math.round((amount + Number.EPSILON) * 100);
  };
  let paymentCents = toCents(amountPaid);
  const ordered = sessions
    .filter(session => session.status !== "cancelled")
    .slice()
    .sort((a, b) => sessionInstants(a).start.getTime() - sessionInstants(b).start.getTime()
      || (a.id ?? 0) - (b.id ?? 0));

  return ordered.flatMap(session => {
    const chargeCents = toCents(session.amount);
    const paidCents = Math.min(paymentCents, chargeCents);
    paymentCents -= paidCents;
    const remainingCents = chargeCents - paidCents;
    if (remainingCents === 0) return [];
    return [{
      ...session,
      originalAmount: chargeCents / 100,
      appliedPayment: paidCents / 100,
      remainingCents,
      remainingAmount: remainingCents / 100,
    }];
  });
}

function formatDate(dateValue: Date | string) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    timeZone: DUBAI_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMonthLabel(sessions: InvoiceSession[]) {
  if (sessions.length === 0) return "Current Period";

  const firstDate = sessionInstants(sessions[0]).start;

  return firstDate.toLocaleDateString("en-GB", {
    timeZone: DUBAI_TIME_ZONE,
    month: "long",
    year: "numeric",
  });
}

export function buildInvoice({
  studentName,
  tutorName,
  subject,
  sessions: allSessions,
  amountPaid = 0,
}: InvoiceData) {
  const sessions = getUnpaidInvoiceSessions(allSessions, amountPaid);
  if (sessions.length === 0) {
    return null;
  }
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;

  // Each row already contains its outstanding amount. Do not subtract payments again.
  const balanceDue = sessions.reduce((sum, session) => sum + session.remainingCents, 0) / 100;

  const issueDate = new Date().toLocaleDateString("en-GB", {
    timeZone: DUBAI_TIME_ZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  doc.setFillColor(35, 37, 84);
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("K-Cubed Tutoring", margin, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Bank Transfer Invoice", margin, 30);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Issued: ${issueDate}`, pageWidth - margin, 31, {
    align: "right",
  });

  doc.setTextColor(30, 30, 30);

  let y = 58;

  doc.setFillColor(245, 247, 252);
  doc.roundedRect(margin, y, 82, 42, 4, 4, "F");
  doc.roundedRect(pageWidth - margin - 82, y, 82, 42, 4, 4, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(90, 90, 90);
  doc.text("FROM", margin + 6, y + 10);
  doc.text("BILL TO", pageWidth - margin - 76, y + 10);

  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(tutorName || "Tutor", margin + 6, y + 21);
  doc.text("K-Cubed Tutoring", margin + 6, y + 30);

  doc.text(studentName || "Student", pageWidth - margin - 76, y + 21);
  doc.text("Tutoring Client", pageWidth - margin - 76, y + 30);

  y += 58;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(35, 37, 84);
  doc.text("Invoice Details", margin, y);

  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Subject: ${subject}`, margin, y);
  doc.text(`Period: ${getMonthLabel(sessions)}`, margin, y + 8);
  doc.text("Payment Method: Online Bank Transfer", margin, y + 16);
  doc.text(`Unpaid Sessions: ${sessions.length} | All lesson times: Dubai (UTC+4)`, margin, y + 24);

  y += 40;

  doc.setFillColor(35, 37, 84);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("#", margin + 4, y + 8);
  doc.text("Date", margin + 16, y + 8);
  doc.text("Time (Dubai)", margin + 52, y + 8);
  doc.text("Hours", margin + 91, y + 8);
  doc.text("Notes", margin + 112, y + 8);
  doc.text("Due", pageWidth - margin - 4, y + 8, { align: "right" });

  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  sessions.forEach((session, index) => {
    if (y > 245) {
      doc.addPage();
      y = 25;
    }

    const rowHeight = 16;
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(248, 249, 253);
      doc.rect(margin, y - 7, pageWidth - margin * 2, rowHeight, "F");
    }

    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);

    doc.text(String(index + 1), margin + 4, y);
    doc.text(formatDate(sessionInstants(session).start), margin + 16, y);
    const { start, end } = sessionInstants(session);
    const first = zonedParts(start), last = zonedParts(end);
    doc.text(`${first.time} - ${last.time}`, margin + 52, y);
    if (first.date !== last.date) {
      doc.setFontSize(7);
      doc.text(`Ends ${formatDate(end)}`, margin + 52, y + 5);
      doc.setFontSize(9);
    }
    doc.text(`${Number(session.durationHours).toFixed(2)}`, margin + 91, y);

    const notes = session.notes || "Tutoring session";
    const clippedNotes =
      notes.length > 24 ? `${notes.substring(0, 24)}...` : notes;

    doc.text(clippedNotes, margin + 112, y);
    if (session.appliedPayment > 0) {
      doc.setFontSize(7);
      doc.text(`Paid $${session.appliedPayment.toFixed(2)} of $${session.originalAmount.toFixed(2)}`, margin + 112, y + 5);
      doc.setFontSize(9);
    }

    doc.setFont("helvetica", "bold");
    doc.text(
      `$${session.remainingAmount.toFixed(2)} USD`,
      pageWidth - margin - 4,
      y,
      { align: "right" }
    );

    doc.setFont("helvetica", "normal");

    y += rowHeight;
  });

  y += 8;
  // Keep totals on the page when an invoice contains many outstanding lessons.
  if (y + 32 > 275) {
    doc.addPage();
    y = 25;
  }
  doc.setFillColor(235, 248, 243);
  doc.roundedRect(pageWidth - margin - 82, y, 82, 24, 4, 4, "F");
  doc.setTextColor(40, 120, 85);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("BALANCE DUE", pageWidth - margin - 76, y + 14);
  doc.text(`$${balanceDue.toFixed(2)} USD`, pageWidth - margin - 6, y + 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text("Only unpaid session balances are included. Payments are applied oldest first.", margin, y + 31);

  // PAGE 2: BANK TRANSFER DETAILS
  doc.addPage();

  doc.setFillColor(35, 37, 84);
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Transfer Details", margin, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Please use the details below to complete payment.", margin, 32);

  y = 60;

  doc.setTextColor(35, 37, 84);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Instructions", margin, y);

  y += 12;

  doc.setFillColor(245, 247, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 82, 4, 4, "F");

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text("Bank Name: Example Bank", margin + 8, y + 12);
  doc.text("Account Name: K-Cubed Tutoring", margin + 8, y + 24);
  doc.text("Account Number: 1234567890", margin + 8, y + 36);
  doc.text("Routing Number: 021000021", margin + 8, y + 48);
  doc.text("SWIFT/BIC: EXAMPUS3M", margin + 8, y + 60);
  doc.text("Reference: Please include the student name or invoice name", margin + 8, y + 72);

  y += 100;

  doc.setTextColor(35, 37, 84);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Amount to Transfer", margin, y);

  y += 12;

  doc.setFillColor(235, 248, 243);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 4, 4, "F");

  doc.setTextColor(40, 120, 85);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Balance Due: $${balanceDue.toFixed(2)} USD`, margin + 8, y + 19);

  y += 50;

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This is placeholder bank transfer information. Replace it with your real bank details before sending invoices to clients.",
    margin,
    y,
    {
      maxWidth: pageWidth - margin * 2,
    }
  );

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Thank you for choosing K-Cubed Tutoring. Please complete payment by bank transfer.",
    pageWidth / 2,
    288,
    { align: "center" }
  );

  return { bytes: doc.output("arraybuffer"), sessionCount: sessions.length, balanceDue };
}