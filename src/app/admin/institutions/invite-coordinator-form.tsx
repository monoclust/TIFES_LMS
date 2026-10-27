"use client";

import { useState } from "react";
import { Copy, Send } from "lucide-react";

export function InviteCoordinatorForm({ institutionId }: { institutionId: string }) {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInviteUrl("");
    setCopied(false);
    setPending(true);
    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId, email: email.trim().toLowerCase(), role: "INSTITUTION_COORDINATOR" }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Invitation could not be created.");
        return;
      }
      setInviteUrl(payload.inviteUrl);
      setEmail("");
    } catch {
      setError("The service could not be reached. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch {
      setError("Clipboard access was blocked. Select and copy the link manually.");
    }
  }

  return <div className="invite-box"><form onSubmit={submit} className="invite-form"><label htmlFor={"coordinator-" + institutionId}>Invite coordinator</label><div className="invite-row"><input id={"coordinator-" + institutionId} type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required placeholder="coordinator@school.edu" /><button className="btn btn-primary" type="submit" disabled={pending}><Send size={13} />{pending ? "Creating…" : "Create link"}</button></div></form>{error ? <p className="auth-error" role="alert">{error}</p> : null}{inviteUrl ? <div className="invite-result"><p><strong>One-time invitation link created.</strong> It expires in 48 hours and has not been emailed.</p><div className="invite-url">{inviteUrl}</div><button className="btn" type="button" onClick={copyLink}><Copy size={13} />{copied ? "Copied" : "Copy invitation link"}</button></div> : null}</div>;
}
