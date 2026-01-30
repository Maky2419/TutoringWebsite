import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { sendEmail } from "../../../../lib/mailer";
import { env } from "process";

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
      include: { tutor: true }
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

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus }
    });

    const tutorName = booking.tutor?.name || "Your tutor";

    const subjectLine =
      newStatus === "ACCEPTED"
        ? "Your tutoring request was accepted ✅"
        : "Your tutoring request was declined";

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>${subjectLine}</h2>
        <p><strong>Tutor:</strong> ${tutorName}</p>
        <p><strong>Student Name:</strong> ${booking.studentName}</p>
        <p><strong>Topic:</strong> ${booking.subject}</p>
        <p><strong>Preferred times:</strong> ${booking.preferredTimes}</p>

        ${
          newStatus === "ACCEPTED"
            ? `<p style="margin-top:12px">The tutor accepted your request. They’ll reach out soon to confirm a time.</p>`
            : `<p style="margin-top:12px">Unfortunately, the tutor declined this request. Please try another tutor/time.</p>`
        }

        <p style="margin-top:18px;color:#666;font-size:12px">
          If you didn’t request tutoring, you can ignore this email.
        </p>
      </div>
    `;

    // ✅ REQUIRED: include text
    const text = [
      subjectLine,
      `Tutor: ${tutorName}`,
      `Topic: ${booking.subject}`,
      `Preferred times: ${booking.preferredTimes}`,
      newStatus === "ACCEPTED"
        ? "The tutor accepted your request. They’ll reach out soon to confirm a time."
        : "The tutor declined this request. Please try another tutor/time."
    ].join("\n");

    try {
      await sendEmail({
        to: booking.studentEmail,
        subject: subjectLine,
        text,
        html
      });
      await sendEmail({
        to: env.ADMIN_EMAIL,
        subject: subjectLine,
        text,
        html
      });

      console.log("✅ Student notified:", booking.studentEmail);
    } catch (e) {
      console.error("❌ Failed to email student:", e);
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
    headers: { "Content-Type": "text/html; charset=utf-8" }
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
