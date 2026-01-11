import nodemailer from "nodemailer";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function getMailer() {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(requiredEnv("SMTP_PORT"));
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export function getFromAddress(): string {
  return process.env.SMTP_FROM || requiredEnv("SMTP_USER");
}

export async function sendEmail(params: { to: string; subject: string; text: string; html?: string }) {
  const transporter = getMailer();
  await transporter.sendMail({
    from: getFromAddress(),
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html
  });
}
