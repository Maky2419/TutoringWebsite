import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendEmail } from "../../../lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tutorId = Number(body.tutorId);
    const studentName = String(body.studentName || "").trim();
    const studentEmail = String(body.studentEmail || "").trim();
    const subject = String(body.subject || "").trim();
    const preferredTimes = String(body.preferredTimes || "").trim();
    const message = body.message ? String(body.message).trim() : "";
    

    if (!tutorId || Number.isNaN(tutorId)) {
      return NextResponse.json({ error: "tutorId is required" }, { status: 400 });
    }
    if (!studentName) {
      return NextResponse.json({ error: "studentName is required" }, { status: 400 });
    }
    if (!studentEmail) {
      return NextResponse.json({ error: "studentEmail is required" }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: "subject is required" }, { status: 400 });
    }
    if (!preferredTimes) {
      return NextResponse.json({ error: "preferredTimes is required" }, { status: 400 });
    }

    const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } });
    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    const acceptToken = crypto.randomUUID();
    const declineToken = crypto.randomUUID();

    const booking = await prisma.booking.create({
      data: {
        tutorId,
        studentName,
        studentEmail,
        subject,
        preferredTimes,
        message: message || null,
        acceptToken,
        declineToken
      }
    });

    let emailSent = false;
    let emailError: string | null = null;

    try {
      const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

      // ✅ Your respond route path:
      const acceptUrl = `${baseUrl}/api/bookings/respond?action=accept&id=${booking.id}&token=${acceptToken}`;
      const declineUrl = `${baseUrl}/api/bookings/respond?action=decline&id=${booking.id}&token=${declineToken}`;

      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>New tutoring request</h2>
          <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Preferred times:</strong> ${preferredTimes}</p>
          ${message ? `<p><strong>Message:</strong><br/>${message}</p>` : ""}

          <div style="margin-top:16px">
            <a href="${acceptUrl}" style="background:#16a34a;color:white;padding:10px 14px;border-radius:10px;text-decoration:none;margin-right:10px;">Accept</a>
            <a href="${declineUrl}" style="background:#dc2626;color:white;padding:10px 14px;border-radius:10px;text-decoration:none;">Decline</a>
          </div>

          <p style="margin-top:12px;color:#666;font-size:12px">
            If you didn’t expect this email, you can ignore it.
          </p>
        </div>
      `;

      // ✅ REQUIRED: include text
      const text = [
        "New tutoring request",
        `Student: ${studentName} (${studentEmail})`,
        `Subject: ${subject}`,
        `Preferred times: ${preferredTimes}`,
        message ? `Message: ${message}` : "",
        "",
        `Accept: ${acceptUrl}`,
        `Decline: ${declineUrl}`
      ]
        .filter(Boolean)
        .join("\n");

      const adminEmail = process.env.ADMIN_EMAIL;

await sendEmail({
  to: adminEmail ? [tutor.email, adminEmail] : tutor.email,
  subject: `New tutoring request: ${subject}`,
  text,
  html
});

      console.log("✅ Email sent to tutor:", tutor.email);
      emailSent = true;
    } catch (e: any) {
      emailError = e?.message || "Email failed";
      console.error("❌ Email send failed:", e);
    }

    return NextResponse.json(
      {
        ok: true,
        booking,
        emailSent,
        emailError
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("❌ Booking POST failed:", e);
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}
