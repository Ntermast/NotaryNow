// src/types/next-auth.d.ts
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    approvalStatus?: string;
    rejectionReason?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      phone?: string;
      notaryApprovalStatus?: string;
      notaryRejectionReason?: string | null;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    notaryApprovalStatus?: string;
    notaryRejectionReason?: string | null;
  }
}
