import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return <main className="auth-page">
    <section className="auth-story" aria-label="Techievo learning platform introduction">
      <Image src="/brand/White_Logo.svg" alt="Techievo" width={160} height={46} priority unoptimized className="auth-logo" />
      <div className="auth-story-copy"><span className="auth-kicker">TECHIEVO LEARNING PLATFORM</span><h1>Learning, built forward.</h1><p>One learning space for classes, projects, mentorship and measurable progress. Sign in to continue your learning journey.</p>
        <ul><li><span>01</span> Pick up classes and learning resources</li><li><span>02</span> Build projects and submit your work</li><li><span>03</span> Receive feedback and track progress</li></ul>
      </div>
      <p className="auth-story-footer">Learn. Build. Evolve.</p>
    </section>
    <section className="auth-panel"><div className="auth-panel-inner"><Image src="/brand/Black_Logo.svg" alt="Techievo" width={132} height={38} unoptimized className="auth-mobile-logo" /><span className="auth-kicker">SECURE WORKSPACE ACCESS</span><h2>Welcome back</h2><p className="auth-intro">Enter your account details to access your workspace.</p><LoginForm /><p className="auth-invite">New to the platform? <Link href="/accept-invitation">Accept an invitation</Link></p><div className="auth-roles"><span>Super Admin</span><span>Coordinator</span><span>Student</span><span>Mentor</span><span>Instructor</span></div><p className="auth-footnote">Access is assigned through your verified account and institution membership. Selecting a role does not grant permissions.</p></div></section>
  </main>;
}
