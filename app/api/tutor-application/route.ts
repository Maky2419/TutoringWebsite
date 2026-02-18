import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // keep node runtime (attachments need Buffer)

function requiredString(formData: FormData, key: string) {
  const v = formData.get(key);
  if (!v || typeof v !== "string" || !v.trim()) throw new Error(`Missing ${key}`);
  return v.trim();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = requiredString(formData, "name");
    const email = requiredString(formData, "email");
    const phone = (formData.get("phone") as string | null)?.toString().trim() || "";
    const subjects = requiredString(formData, "subjects");
    const experience = requiredString(formData, "experience");
    const location = requiredString(formData, "location");
    const message = requiredString(formData, "message");

    const resume = formData.get("resume");
    if (!resume || !(resume instanceof Blob)) {
      return NextResponse.json({ error: "Missing resume file" }, { status: 400 });
    }

    // File size check (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (resume.size > maxBytes) {
      return NextResponse.json({ error: "Resume is too large (max 5MB)." }, { status: 400 });
    }

    // MIME type check (soft — some browsers may send empty type)
    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    if (resume.type && !allowedTypes.has(resume.type)) {
      return NextResponse.json({ error: "Resume must be a PDF or DOC/DOCX file." }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    if (!adminEmail) {
      return NextResponse.json(
        { error: "Server is missing ADMIN_EMAIL configuration." },
        { status: 500 }
      );
    }
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Server is missing RESEND_API_KEY configuration." },
        { status: 500 }
      );
    }
    if (!emailFrom) {
      return NextResponse.json(
        { error: "Server is missing EMAIL_FROM configuration." },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await resume.arrayBuffer());
    const filename = (resume as any).name || "resume";

    const subjectLine = `New Tutor Application: ${name} (${subjects})`;

    const textBody = [
      "New tutor application received:",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "Phone: (not provided)",
      `Subjects: ${subjects}`,
      `Experience: ${experience}`,
      `Location/Timezone: ${location}`,
      "",
      "Message:",
      message,
      "",
      "Resume attached.",
    ].join("\n");

    const resend = new Resend(resendApiKey);

    const { error } = await resend.emails.send({
      from: emailFrom,
      to: [adminEmail],
      reply_to: email,
      subject: subjectLine,
      text: textBody,
      attachments: [
        {
          filename,
          content: buffer.toString("base64"),
        },
      ],
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to send email." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}
