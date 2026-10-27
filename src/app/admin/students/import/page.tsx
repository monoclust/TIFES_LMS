import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/current-actor";
import { prisma } from "@/lib/db";
import { StudentImportForm } from "./student-import-form";

export default async function StudentImportPage() {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login");
  if (actor.platformRole !== "SUPER_ADMIN") redirect("/access-denied");
  const institutions = await prisma.institution.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true, slug: true },
  });
  return <main className="admin-page"><header className="admin-topbar"><Link href="/admin/institutions" className="admin-brand"><Image src="/brand/Black_Logo.svg" alt="Techievo" width={126} height={36} unoptimized style={{ width: 126, height: "auto" }} /></Link><div className="admin-top-actions"><span>Platform administration</span><Link className="btn" href="/admin/institutions">Institutions</Link></div></header><div className="admin-content"><div className="admin-breadcrumb"><Link href="/admin/institutions">Super Admin</Link><span>/</span>Students<span>/</span>Import</div><div className="admin-heading"><div><div className="eyebrow">Student operations</div><h1>Import student roster</h1><p>Validate records and enrollment references before committing data to an institution.</p></div></div>{institutions.length ? <StudentImportForm institutions={institutions} /> : <section className="admin-panel"><div className="admin-panel-head"><div><h2>No active institutions</h2><p>Create an institution before importing students.</p></div></div><div style={{ padding: 20 }}><Link className="btn btn-primary" href="/admin/institutions">Create institution</Link></div></section>}</div></main>;
}
