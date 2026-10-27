import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { prisma } from "@/lib/db";

export default async function WorkspacePage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.authenticated || session.user.status !== "ACTIVE") redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, platformRole: true, memberships: { where: { isActive: true }, select: { role: true, institution: { select: { name: true } } } } },
  });
  if (!user) redirect("/login");
  if (!user.platformRole && user.memberships.length === 0) redirect("/access-denied");
  const roleLabel = user.platformRole === "SUPER_ADMIN"
    ? "Super Admin"
    : user.memberships.map((membership) => membership.role.replaceAll("_", " ").toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")).join(", ");
  const institutionNames = [...new Set(user.memberships.map((membership) => membership.institution.name))];
  return <main className="workspace-handoff"><div className="workspace-card"><div className="workspace-brand"><span className="brand-mark">T.</span><span className="brand-name">techievo</span></div><span className="auth-kicker">AUTHENTICATED SESSION</span><h1>{"You're signed in" + (user.name ? ", " + user.name : "") + "."}</h1><p>Your account has been verified. The full role-specific workspace is being delivered in the next implementation milestone.</p><dl><div><dt>Resolved role</dt><dd>{roleLabel}</dd></div><div><dt>Institution scope</dt><dd>{user.platformRole === "SUPER_ADMIN" ? "Platform-wide" : institutionNames.join(", ")}</dd></div><div><dt>Session status</dt><dd>Active · role checked server-side</dd></div></dl>{user.platformRole === "SUPER_ADMIN" ? <Link className="btn btn-primary" href="/admin/institutions">Manage institutions</Link> : null} <Link className="btn" href="/">Open UI foundation preview</Link><p className="workspace-note">This handoff page does not grant extra permissions. Data routes must enforce server-side resource checks independently.</p></div></main>;
}
