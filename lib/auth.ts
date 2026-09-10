import { recordActivity } from "./activity";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const providers: NextAuthOptions["providers"] = [
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
];

// Only advertise OAuth providers that have been configured. Email/password
// remains available for every email domain.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }));
}
if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(AppleProvider({
    clientId: process.env.APPLE_ID,
    clientSecret: process.env.APPLE_SECRET,
    allowDangerousEmailAccountLinking: true,
  }));
}
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
  providers.push(AzureADProvider({
    clientId: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    allowDangerousEmailAccountLinking: true,
  }));
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  events: {
    async signOut(message) {
      const id = message.token?.id || message.token?.sub;
      if (typeof id === "string") {
        await recordActivity(prisma, { actorId: id, action: "LOGOUT", entityType: "User", entityId: id });
      }
    },
    async signIn({ user, account }) {
      // signIn runs for a successful login, not session reads or page refreshes.
      await prisma.$transaction(async tx => {
        await tx.loginHistory.create({ data: {
          userId: user.id, createdAt: new Date(), provider: account?.provider || "credentials",
        } });
        await recordActivity(tx, { actorId: user.id, action: "LOGIN", entityType: "User", entityId: user.id,
          details: { provider: account?.provider || "credentials" } });
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (token.invalid) return token;
      if (user) {
        token.id = user.id;
        const suppliedVersion = (user as typeof user & { sessionVersion?: number }).sessionVersion;
        if (typeof suppliedVersion === "number") token.sessionVersion = suppliedVersion;
      }
      const userId = typeof token.id === "string" ? token.id : token.sub;
      if (!userId) return { invalid: true };
      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, sessionVersion: true },
      });
      // OAuth adapter users do not include custom Prisma fields in the first
      // callback, so initialize the version from the authoritative user row.
      if (user && typeof token.sessionVersion !== "number" && current) {
        token.sessionVersion = current.sessionVersion;
      }
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
