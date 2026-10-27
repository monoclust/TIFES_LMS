import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email address", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || user.status !== "ACTIVE" || !user.passwordHash) return null;
        const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordMatches) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          authVersion: user.authVersion,
          platformRole: user.platformRole,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.authVersion = user.authVersion;
        token.platformRole = user.platformRole;
        token.status = user.status;
      }
      // Re-check account status and authVersion so suspension/password reset can revoke JWT sessions.
      if (token.sub) {
        const current = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { status: true, authVersion: true, platformRole: true },
        });
        if (!current || current.status !== "ACTIVE" || token.authVersion !== current.authVersion) {
          token.revoked = true;
          token.status = current?.status ?? "DISABLED";
        } else {
          token.revoked = false;
          token.status = current.status;
          token.platformRole = current.platformRole;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.platformRole = token.platformRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : null;
        session.user.status = token.status === "ACTIVE" || token.status === "INVITED" || token.status === "SUSPENDED" || token.status === "DISABLED" ? token.status : "DISABLED";
        session.user.authenticated = token.revoked !== true;
      }
      return session;
    },
  },
});
