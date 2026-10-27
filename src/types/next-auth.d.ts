import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    authVersion: number;
    platformRole: "SUPER_ADMIN" | null;
    status: "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED";
  }
  interface Session {
    user: NonNullable<DefaultSession["user"]> & {
      id: string;
      platformRole: "SUPER_ADMIN" | null;
      status: "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED";
      authenticated: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    authVersion?: number;
    platformRole?: "SUPER_ADMIN" | null;
    status?: "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED";
    revoked?: boolean;
  }
}
