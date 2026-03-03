import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { sendEmail } from "../../../../lib/mailer";
export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const action = (url.searchParams.get("action") || "").toLowerCase();
    const idParam = url.searchParams.get("id");
    const token = url.searchParams.get("token") || "";

    const bookingId = Number(idParam);

    if (!idParam || Number.isNaN(bookingId)) {
      return htmlPage(400, "Invalid booking id.", "Missing or invalid `id` parameter.");
    }

    if (action !== "accept" && action !== "decline") {
      return htmlPage(400, "Invalid action.", "Action must be `accept` or `decline`.");
    }

    if (!token) {
      return htmlPage(400, "Missing token.", "This link is incomplete or expired.");
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tutor: true },
    });

    if (!booking) {
      return htmlPage(404, "Booking not found.", "This request may have been deleted.");
    }

    const expectedToken = action === "accept" ? booking.acceptToken : booking.declineToken;

    if (token !== expectedToken) {
      return htmlPage(403, "Invalid or expired link.", "This decision link is no longer valid.");
    }

    if (booking.status === "ACCEPTED" || booking.status === "DECLINED") {
      return htmlPage(200, "Already recorded ✅", `This booking was already marked as ${booking.status}.`);
    }

    const newStatus = action === "accept" ? "ACCEPTED" : "DECLINED";

    // Update status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    const tutorName = booking.tutor?.name || "Your tutor";
    const tutorEmail = booking.tutor?.email || "";

    // Student-facing subject + copy
    const studentSubject =
      newStatus === "ACCEPTED"
        ? "Your tutoring request was accepted ✅"
        : "Update: your tutoring request was declined ❌";

    const studentText =
      newStatus === "ACCEPTED"
        ? `Hi ${booking.studentName},

Good news — ${tutorName} accepted your tutoring request on K-Cubed Tutoring.

They’ll reach out to you shortly using the contact details you provided.

Warm regards,
K-Cubed Tutoring Team`
        : `Hi ${booking.studentName},

Unfortunately, ${tutorName} declined your tutoring request on K-Cubed Tutoring.

Please submit another request with a different time/tutor.

Warm regards,
K-Cubed Tutoring Team`;

    const studentHtml =
      newStatus === "ACCEPTED"
        ? `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <p>Hi ${booking.studentName},</p>
            <p><strong>Good news — ${tutorName} accepted your tutoring request on K-Cubed.</strong></p>
            <p>They’ll reach out to you shortly using the contact details you provided.</p>
            <p>Warm regards,<br/>K-Cubed Tutoring Team</p>
          </div>`
        : `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <p>Hi ${booking.studentName},</p>
            <p><strong>Unfortunately, ${tutorName} declined your tutoring request.</strong></p>
            <p>Please submit another request with a different time/tutor.</p>
            <p>Warm regards,<br/>K-Cubed Tutoring Team</p>
          </div>`;

    // Admin notification
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminSubject = `Booking ${newStatus}: ${booking.subject}`;
    const adminText = `Booking ${newStatus}

Tutor: ${tutorName}${tutorEmail ? ` (${tutorEmail})` : ""}
Student: ${booking.studentName} (${booking.studentEmail})
Subject: ${booking.subject}
Preferred times: ${booking.preferredTimes}
`;

    // Tutor confirmation (optional)
    const tutorSubject =
      newStatus === "ACCEPTED"
        ? "You accepted a tutoring request ✅"
        : "You declined a tutoring request";

    const tutorText = `Hi ${tutorName},

You ${newStatus === "ACCEPTED" ? "accepted" : "declined"} the request from ${booking.studentName} (${booking.studentEmail}) for: ${booking.subject}

Preferred times: ${booking.preferredTimes}

Warm regards,
K-Cubed Tutoring Team`;

    try {
      // 1) Student
      await sendEmail({
        to: booking.studentEmail,
        subject: studentSubject,
        text: studentText,
        html: studentHtml,
      });

      await sleep(600); // ✅ throttle to avoid Resend 2 req/sec limit

      // 2) Tutor confirmation
      if (tutorEmail) {
        await sendEmail({
          to: tutorEmail,
          subject: tutorSubject,
          text: tutorText,
        });

        await sleep(600); // ✅ throttle
      }

      // 3) Admin notification
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: adminSubject,
          text: adminText,
        });
      }

      console.log("✅ Decision emails sent:", { bookingId, newStatus });
    } catch (e) {
      console.error("❌ Failed to send decision emails:", e);
    }

    return htmlPage(
      200,
      newStatus === "ACCEPTED" ? "Accepted ✅" : "Declined ❌",
      "Your response was recorded. You can close this tab."
    );
  } catch (e: any) {
    console.error("❌ respond route failed:", e);
    return htmlPage(500, "Server error", e?.message || "Unknown error");
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function htmlPage(status: number, title: string, message: string) {
  const body = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0b1220; color: #fff; margin: 0; padding: 40px; }
      .card { max-width: 720px; margin: 0 auto; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); border-radius: 16px; padding: 24px; }
      h1 { font-size: 22px; margin: 0 0 10px; }
      p { margin: 0; color: rgba(255,255,255,0.80); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
    </div>
  </body>
</html>`;

  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
