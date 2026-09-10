import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function publicOrigin(request: Request) {
  // Behind Nginx, request.url may be http://localhost:3000. Prefer the
  // canonical production URL used by NextAuth.
  const configuredUrl = process.env.NEXTAUTH_URL || process.env.APP_BASE_URL;
  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Fall through to the proxy headers if the environment value is invalid.
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host) return `${forwardedProtocol || "https"}://${host}`;

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { calendarFeedToken: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let token = user.calendarFeedToken;
  if (!token) {
    token = randomBytes(32).toString("hex");
    await prisma.user.update({ where: { id: userId }, data: { calendarFeedToken: token } });
  }

  const origin = publicOrigin(request);
  const feedUrl = `${origin}/api/calendar/${token}`;
  return NextResponse.json({
    feedUrl,
    webcalUrl: feedUrl.replace(/^https?:/, "webcal:"),
    downloadUrl: `${feedUrl}?download=1`,
  });
}
