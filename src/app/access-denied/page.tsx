import Link from "next/link";

export default function AccessDeniedPage() {
  return <main className="workspace-handoff"><section className="workspace-card"><span className="auth-kicker">ACCESS CONTROL</span><h1>This workspace isn&apos;t available to your account.</h1><p>Your account may not have the required role or institution membership. For security, this page does not confirm whether a restricted record exists.</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}><Link className="btn btn-primary" href="/workspace">Return to workspace</Link><Link className="btn" href="/login">Sign in with another account</Link></div></section></main>;
}
