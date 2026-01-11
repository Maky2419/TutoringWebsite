import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { sendEmail } from "../../../../lib/mailer";

function htmlPage(title: string, body: string) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; line-height: 1.5; }
    .card { max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; }
    .muted { color: #6b7280; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    ${body}
  </div>
</body>
</html>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = (url.searchParams.get("action") || "").toLowerCase();
  const token = url.searchParams.get("token") || "";

  if (!token || (action !== "accept" && action !== "decline")) {
    return new NextResponse(
      htmlPage(
        "Invalid link",
        `<h2>Invalid link</h2><p class="muted">This response link is missing parameters.</p>`
      ),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  const booking =
    action === "accept"
      ? await prisma.booking.findUnique({ where: { acceptToken: token }, include: { tutor: true } })
      : await prisma.booking.findUnique({ where: { declineToken: token }, include: { tutor: true } });

  if (!booking || !booking.tutor) {
    return new NextResponse(
      htmlPage(
        "Not found",
        `<h2>Not found</h2><p class="muted">This link is invalid or the booking no longer exists.</p>`
      ),
      { status: 404, headers: { "Content-Type": "text/html" } }
    );
  }

  if (booking.status !== "pending") {
    return new NextResponse(
      htmlPage(
        "Already responded",
        `<h2>Already responded</h2><p class="muted">This request is already <b>${booking.status}</b>.</p>
         <p class="muted">Booking ID: <code>${booking.id}</code></p>`
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }

  const newStatus = action === "accept" ? "accepted" : "declined";

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: newStatus }
  });

  await sendEmail({
    to: booking.studentEmail,
    subject: `Your tutoring request was ${newStatus}`,
    text:
      `Hi ${booking.studentName},\n\n` +
      `Your tutoring request for "${booking.subject}" was ${newStatus} by ${booking.tutor.name}.\n\n` +
      (newStatus === "accepted"
        ? `Next steps: email your tutor at ${booking.tutor.email} to coordinate details.\n\n`
        : `You can submit a new request with a different tutor anytime.\n\n`) +
      `Booking ID: ${booking.id}`
  });

  return new NextResponse(
    htmlPage(
      newStatus === "accepted" ? "Accepted" : "Declined",
      `<h2>Response recorded</h2>
       <p>You have <b>${newStatus}</b> this tutoring request.</p>
       <p class="muted">Student: ${booking.studentName} (${booking.studentEmail})</p>
       <p class="muted">Subject: ${booking.subject}</p>
       <p class="muted">Booking ID: <code>${booking.id}</code></p>
       <p class="muted">The student has been notified by email.</p>`
    ),
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
