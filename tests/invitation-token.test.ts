import { describe, expect, it } from "vitest";
import { createInvitationToken, hashInvitationToken } from "../src/lib/invitation-token";

describe("invitation token helpers", () => {
  it("creates high-entropy raw tokens and a matching digest", () => {
    const token = createInvitationToken();
    expect(token.rawToken.length).toBeGreaterThanOrEqual(40);
    expect(token.tokenHash).toBe(hashInvitationToken(token.rawToken));
    expect(token.tokenHash).not.toBe(token.rawToken);
  });
  it("does not reuse tokens across invitations", () => {
    expect(createInvitationToken().rawToken).not.toBe(createInvitationToken().rawToken);
  });
});
