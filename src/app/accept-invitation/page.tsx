import Link from "next/link";
import Image from "next/image";
import { inspectInvitation } from "@/lib/invitation-service";

export default async function AcceptInvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const invitation = await inspectInvitation(token);
  return <main className="workspace-handoff"><section className="workspace-card"><Image src="/brand/Black_Logo.svg" alt="Techievo" width={132} height={38} unoptimized style={{ width: 132, height: "auto", marginBottom: 28 }} /><span className="auth-kicker">INVITATION ACCESS</span>{invitation ? <><h1>Your invitation is valid.</h1><p>You have been invited to join <strong>{invitation.institutionName}</strong> as <strong>{invitation.role.replaceAll("_", " ").toLowerCase()}</strong>.</p><dl><div><dt>Invited account</dt><dd>{invitation.email}</dd></div><div><dt>Expires</dt><dd>{invitation.expiresAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</dd></div></dl><Link className="btn btn-primary" href={"/account-setup?token=" + encodeURIComponent(token)}>Continue to account setup</Link></> : <><h1>This invitation can&apos;t be used.</h1><p>The invitation may have expired, been revoked, already used, or the institution may be inactive. Ask your institution coordinator for a new invitation.</p><Link className="btn" href="/login">Return to sign in</Link></>}<p className="workspace-note">Invitation links are single-use and time-limited. Do not forward this link to anyone else.</p></section></main>;
}
