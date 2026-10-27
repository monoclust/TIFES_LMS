import Image from "next/image";
import Link from "next/link";
import { inspectInvitation } from "@/lib/invitation-service";
import { completeAccountSetup } from "./actions";

const errors: Record<string, string> = {
  "invalid-input": "Check the fields. Passwords must match and contain at least 12 characters.",
  "setup-failed": "The invitation could not be accepted. It may have expired, already been used, or require a coordinator to reissue it.",
};

export default async function AccountSetupPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token = "", error = "" } = await searchParams;
  const invitation = await inspectInvitation(token);
  return <main className="workspace-handoff"><section className="workspace-card"><Image src="/brand/Black_Logo.svg" alt="Techievo" width={132} height={38} unoptimized style={{ width: 132, height: "auto", marginBottom: 28 }} /><span className="auth-kicker">ACCOUNT SETUP</span><h1>Set up your account.</h1>{invitation ? <><p>Complete your profile for <strong>{invitation.institutionName}</strong>. This invitation is for <strong>{invitation.email}</strong>.</p>{errors[error] ? <p className="auth-error" role="alert">{errors[error]}</p> : null}<form className="auth-form" action={completeAccountSetup}><input type="hidden" name="token" value={token} /><label htmlFor="setup-name">Full name</label><div className="auth-input-wrap"><input id="setup-name" name="name" type="text" autoComplete="name" minLength={2} maxLength={160} required placeholder="Enter your full name" /></div><label htmlFor="setup-password">Create password</label><div className="auth-input-wrap"><input id="setup-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="At least 12 characters" /></div><label htmlFor="setup-confirm">Confirm password</label><div className="auth-input-wrap"><input id="setup-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="Enter the password again" /></div><button className="auth-submit" type="submit">Complete account setup</button></form></> : <><p>This invitation is invalid or expired. Ask your coordinator for a new link.</p><Link className="btn" href="/login">Return to sign in</Link></>}<p className="workspace-note">Use a unique password. The platform stores a password hash, not the original password.</p></section></main>;
}
