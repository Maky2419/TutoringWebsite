import jsPDF from "jspdf";

type InvoiceSession = {
  lessonDate: Date | string;
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

function formatDate(dateValue: Date | string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMonthLabel(sessions: InvoiceSession[]) {
  if (sessions.length === 0) return "Current Period";

  const firstDate = new Date(sessions[0].lessonDate);

  return firstDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function generateInvoice({
  studentName,
  tutorName,
  subject,
  sessions,
  amountPaid = 0,
}: InvoiceData) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;

  const subtotal = sessions.reduce(
    (sum, session) => sum + Number(session.amount || 0),
    0
  );

  const balanceDue = Math.max(subtotal - amountPaid, 0);

  const issueDate = new Date().toLocaleDateString(undefined, {
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
  doc.text(`Number of Sessions: ${sessions.length}`, margin, y + 24);

  y += 40;

  doc.setFillColor(35, 37, 84);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("#", margin + 4, y + 8);
  doc.text("Date", margin + 16, y + 8);
  doc.text("Time", margin + 52, y + 8);
  doc.text("Hours", margin + 91, y + 8);
  doc.text("Notes", margin + 112, y + 8);
  doc.text("Amount", pageWidth - margin - 4, y + 8, { align: "right" });

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
    doc.text(formatDate(session.lessonDate), margin + 16, y);
    doc.text(`${session.startTime} - ${session.endTime}`, margin + 52, y);
    doc.text(`${Number(session.durationHours).toFixed(2)}`, margin + 91, y);

    const notes = session.notes || "Tutoring session";
    const clippedNotes =
      notes.length > 24 ? `${notes.substring(0, 24)}...` : notes;

    doc.text(clippedNotes, margin + 112, y);

    doc.setFont("helvetica", "bold");
    doc.text(
      `AED ${Number(session.amount || 0).toFixed(2)}`,
      pageWidth - margin - 4,
      y,
      { align: "right" }
    );

    doc.setFont("helvetica", "normal");

    y += rowHeight;
  });

  y += 8;

  doc.setFillColor(235, 248, 243);
  doc.roundedRect(pageWidth - margin - 82, y, 82, 38, 4, 4, "F");

  doc.setTextColor(40, 120, 85);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("SUBTOTAL", pageWidth - margin - 76, y + 9);
  doc.text(`AED ${subtotal.toFixed(2)}`, pageWidth - margin - 6, y + 9, {
    align: "right",
  });

  doc.text("PAID", pageWidth - margin - 76, y + 19);
  doc.text(`AED ${amountPaid.toFixed(2)}`, pageWidth - margin - 6, y + 19, {
    align: "right",
  });

  doc.setFontSize(11);
  doc.text("BALANCE DUE", pageWidth - margin - 76, y + 31);
  doc.text(`AED ${balanceDue.toFixed(2)}`, pageWidth - margin - 6, y + 31, {
    align: "right",
  });

  y += 56;

  doc.setTextColor(35, 37, 84);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Transfer Details", margin, y);

  y += 10;

  doc.setFillColor(245, 247, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 35, 4, 4, "F");

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Bank Name: YOUR BANK NAME", margin + 6, y + 10);
  doc.text("Account Name: K-Cubed Tutoring", margin + 6, y + 20);
  doc.text("IBAN: YOUR IBAN HERE", margin + 6, y + 30);

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

  doc.save(`invoice-${studentName}.pdf`);
}