import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs"; // IMPORTANT for nodemailer (not edge)

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

    // ✅ In Node/Next route handlers, uploaded files are Blob-like (File may not exist)
    const resume = formData.get("resume");

    if (!resume || !(resume instanceof Blob)) {
      return NextResponse.json({ error: "Missing resume file" }, { status: 400 });
    }

    // File size check (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (resume.size > maxBytes) {
      return NextResponse.json(
        { error: "Resume is too large (max 5MB)." },
        { status: 400 }
      );
    }

    // MIME type check (soft — some browsers may send empty type)
    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]);

    if (resume.type && !allowedTypes.has(resume.type)) {
      return NextResponse.json(
        { error: "Resume must be a PDF or DOC/DOCX file." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await resume.arrayBuffer());

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json(
        { error: "Server is missing ADMIN_EMAIL configuration." },
        { status: 500 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: "Server is missing SMTP configuration." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true", // true for 465
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

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
      "Resume attached."
    ].join("\n");

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || smtpUser,
      to: adminEmail,
      replyTo: email,
      subject: subjectLine,
      text: textBody,
      attachments: [
        {
          filename: (resume as any).name || "resume",
          content: buffer
        }
      ]
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}
