import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password || !(await bcrypt.compare(password, user.password))) return null;
        return {
          id: user.id, name: user.name, email: user.email,
          role: user.role, sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      // signIn runs for a successful login, not session reads or page refreshes.
      await prisma.loginHistory.create({ data: {
        userId: user.id,
        createdAt: new Date(),
        provider: account?.provider || "credentials",
      } });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (token.invalid) return token;
      if (user) {
        token.id = user.id;
        token.sessionVersion = (user as typeof user & { sessionVersion?: number }).sessionVersion ?? 0;
      }
      const userId = typeof token.id === "string" ? token.id : token.sub;
      if (!userId) return { invalid: true };
      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, sessionVersion: true },
      });
      // Pre-update cookies have version 0. Once reset, they cannot be upgraded.
      if (!current || (token.sessionVersion ?? 0) !== current.sessionVersion) {
        return { invalid: true };
      }
      token.id = current.id;
      token.role = current.role;
      token.name = current.name;
      token.email = current.email;
      token.sessionVersion = current.sessionVersion;
      return token;
    },
    async session({ session, token }) {
      if (token.invalid || !token.id) return { expires: new Date(0).toISOString() };
      if (session.user) {
        (session.user as typeof session.user & { id: unknown; role: unknown }).id = token.id;
        (session.user as typeof session.user & { id: unknown; role: unknown }).role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
