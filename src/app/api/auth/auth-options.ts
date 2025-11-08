// src/app/api/auth/auth-options.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/db";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              notaryProfile: true,
            },
          });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          // Rejected notaries are blocked; pending can still log in (UI will limit actions)
          if (
            user.role === "NOTARY" &&
            user.notaryProfile?.approvalStatus === "REJECTED"
          ) {
            const reason = user.notaryProfile.rejectionReason
              ? ` Reason: ${user.notaryProfile.rejectionReason}.`
              : "";
            throw new Error(
              `Your notary application was declined.${reason} Please contact support if you believe this is a mistake.`
            );
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            approvalStatus: user.notaryProfile?.approvalStatus,
            rejectionReason: user.notaryProfile?.rejectionReason,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (user.role === "NOTARY") {
          token.notaryApprovalStatus = user.approvalStatus;
          token.notaryRejectionReason = user.rejectionReason;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.notaryApprovalStatus) {
          session.user.notaryApprovalStatus = token.notaryApprovalStatus as string;
        }
        if (token.notaryRejectionReason) {
          session.user.notaryRejectionReason = token.notaryRejectionReason as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};
