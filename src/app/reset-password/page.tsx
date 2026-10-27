import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  return <main className="workspace-handoff"><section className="workspace-card"><Image src="/brand/Black_Logo.svg" alt="Techievo" width={132} height={38} unoptimized style={{ width: 132, height: "auto", marginBottom: 28 }} /><span className="auth-kicker">ACCOUNT RECOVERY</span><h1>Password reset</h1><p>Self-service reset delivery is not enabled yet because the email provider and recovery policy have not been configured. Contact your institution coordinator or Techievo support to recover access safely.</p><Link className="btn btn-primary" href="/login">Return to sign in</Link><p className="workspace-note">Support must verify account ownership and never ask you to share your existing password.</p></section></main>;
}
