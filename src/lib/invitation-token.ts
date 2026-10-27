import { createHash, randomBytes } from "node:crypto";

/** Return the raw token once for delivery; persist only its SHA-256 digest. */
export function createInvitationToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("base64url");
  return { rawToken, tokenHash: hashInvitationToken(rawToken) };
}

export function hashInvitationToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}
