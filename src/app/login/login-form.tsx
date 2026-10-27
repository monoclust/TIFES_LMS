"use client";

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) {
      setError("Enter both your email address and password.");
      return;
    }
    startTransition(async () => {
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/workspace" });
      if (!result || result.error) {
        setError("We couldn't sign you in with those details. Check them and try again.");
        return;
      }
      window.location.assign(result.url || "/workspace");
    });
  }

  return <form className="auth-form" onSubmit={submit} noValidate>
    <label htmlFor="email">Email address</label><div className="auth-input-wrap"><Mail size={17} aria-hidden="true" /><input id="email" name="email" type="email" autoComplete="username" placeholder="you@institution.edu" maxLength={254} required disabled={pending} /></div>
    <div className="auth-password-label"><label htmlFor="password">Password</label><a href="/reset-password" aria-label="Open password reset page">Forgot password?</a></div><div className="auth-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" maxLength={128} required disabled={pending} /><button className="password-toggle" type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"} disabled={pending}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
    {error ? <p className="auth-error" role="alert">{error}</p> : null}
    <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in to LMS"} <ArrowRight size={17} /></button>
    <div className="auth-secure"><LockKeyhole size={14} /><span>Secure access · Institution-scoped permissions</span></div>
  </form>;
}
