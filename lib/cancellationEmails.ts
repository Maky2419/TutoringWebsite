import { sendEmail } from "./mailer";
import { formatSessionRange } from "./sessionTime";

type CancellationEmailSession = {
  id: number;
  lessonDate: Date;
  startsAt: Date | null;
  endsAt: Date | null;
  sourceTimeZone: string | null;
  startTime: string;
  endTime: string;
  cancellationReason: string | null;
  assignment: {
    student: { name: string | null; email: string | null };
    tutor: { name: string; email: string };
  };
};

function sessionTime(session: CancellationEmailSession) {
  return `${formatSessionRange(session)} (Dubai time)`;
}

export async function emailTutorCancellationRequest(session: CancellationEmailSession) {
  const tutorEmail = session.assignment.tutor.email?.trim();
  if (!tutorEmail) throw new Error("Tutor email is missing.");
  const tutorName = session.assignment.tutor.name || "Tutor";
  const studentName = session.assignment.student.name || "Your student";
  const studentEmail = session.assignment.student.email || "No student email";
  const dashboardUrl = `${process.env.APP_BASE_URL || "https://kcubed.ca"}/tutor/dashboard`;
  await sendEmail({
    to: tutorEmail,
    subject: `Cancellation request from ${studentName}`,
    replyTo: session.assignment.student.email || undefined,
    text: `Hi ${tutorName},\n\n${studentName} (${studentEmail}) requested to cancel a tutoring session.\n\nSession: ${sessionTime(session)}\nReason: ${session.cancellationReason || "No reason provided"}\n\nReview the request and accept or decline it here:\n${dashboardUrl}\n\nWarm regards,\nK-Cubed Tutoring Team`,
  });
}

export async function emailStudentCancellationDecision(
  session: CancellationEmailSession,
  decision: "accepted" | "declined",
) {
  const studentEmail = session.assignment.student.email?.trim();
  if (!studentEmail) throw new Error("Student email is missing.");
  const studentName = session.assignment.student.name || "Student";
  const tutorName = session.assignment.tutor.name || "Your tutor";
  const accepted = decision === "accepted";
  await sendEmail({
    to: studentEmail,
    subject: accepted ? "Your session cancellation was accepted" : "Your session cancellation was declined",
    replyTo: session.assignment.tutor.email || undefined,
    text: `Hi ${studentName},\n\n${tutorName} ${accepted ? "accepted" : "declined"} your cancellation request.\n\nSession: ${sessionTime(session)}\nYour reason: ${session.cancellationReason || "No reason provided"}\n\n${accepted ? "The session is now cancelled." : "The session remains scheduled. Please contact your tutor if you need to discuss it."}\n\nWarm regards,\nK-Cubed Tutoring Team`,
  });
}
