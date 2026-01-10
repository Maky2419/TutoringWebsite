import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").toLowerCase().trim();

  if (!email || !body.password || !body.fullName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

  // NOTE: password is stored in plaintext here as a placeholder.
  // Replace with hashing (bcrypt/argon2) before production.
  const user = await prisma.user.create({
    data: { email, fullName: String(body.fullName), password: String(body.password), role: "student" }
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
