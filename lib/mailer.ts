import { Resend } from "resend";

type To = string | string[];

type Attachment = {
  filename: string;
  content: Buffer; // raw bytes
};

export async function sendEmail(args: {
  to: To;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: Attachment[];
}) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!resendKey) throw new Error("Missing RESEND_API_KEY");
  if (!from) throw new Error("Missing EMAIL_FROM");

  const resend = new Resend(resendKey);

  const toList = Array.isArray(args.to) ? args.to : [args.to];

  const { error } = await resend.emails.send({
    from,
    to: toList,
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo: args.replyTo,
    attachments: args.attachments?.map(a => ({
      filename: a.filename,
      content: a.content.toString("base64"),
    })),
  });

  if (error) throw new Error(error.message || "Resend send failed");
}
