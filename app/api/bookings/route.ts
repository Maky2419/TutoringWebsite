import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendEmail } from "../../../lib/mailer";
import crypto from "crypto";

function appBaseUrl(req: Request) {
  const envBase = process.env.APP_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  const url = new URL(req.url);
  return url.origin;
}

export async function GET() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { tutor: true }
  });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const body = await req.json();

  const studentName = String(body.studentName || "").trim();
  const studentEmail = String(body.studentEmail || "").trim();
  const subject = String(body.subject || "").trim();
  const preferredTimes = String(body.preferredTimes || "").trim();
  const message = body.message ? String(body.message).trim() : undefined;
  const tutorId = body.tutorId ? Number(body.tutorId) : undefined;

  if (!studentName || !studentEmail || !subject || !preferredTimes) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!tutorId || Number.isNaN(tutorId)) {
    return NextResponse.json({ error: "Please select a tutor." }, { status: 400 });
  }

  const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } });
  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found." }, { status: 404 });
  }

  const acceptToken = crypto.randomBytes(24).toString("hex");
  const declineToken = crypto.randomBytes(24).toString("hex");

  const booking = await prisma.booking.create({
    data: {
      studentName,
      studentEmail,
      subject,
      preferredTimes,
      message,
      tutorId,
      acceptToken,
      declineToken
    },
    include: { tutor: true }
  });

  const base = appBaseUrl(req);
  const acceptUrl = `${base}/api/bookings/respond?action=accept&token=${acceptToken}`;
  const declineUrl = `${base}/api/bookings/respond?action=decline&token=${declineToken}`;

  await sendEmail({
    to: tutor.email,
    subject: `New tutoring request: ${subject}`,
    text:
      `You have a new tutoring request.\n\n` +
      `Student: ${studentName} (${studentEmail})\n` +
      `Subject: ${subject}\n` +
      `Preferred times: ${preferredTimes}\n` +
      (message ? `Message: ${message}\n\n` : "\n") +
      `Accept: ${acceptUrl}\n` +
      `Decline: ${declineUrl}\n\n` +
      `Booking ID: ${booking.id}`
  });

  await sendEmail({
    to: studentEmail,
    subject: "We received your tutoring request",
    text:
      `Hi ${studentName},\n\n` +
      `Your request for "${subject}" has been sent to ${tutor.name}.\n` +
      `We'll email you as soon as the tutor responds.\n\n` +
      `Summary:\n` +
      `Preferred times: ${preferredTimes}\n` +
      (message ? `Message: ${message}\n\n` : "\n") +
      `Thanks!`
  });

  return NextResponse.json(booking, { status: 201 });
}
