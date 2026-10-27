import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Plus, Search, Users } from "lucide-react";
import { getCurrentActor } from "@/lib/current-actor";
import { listInstitutions } from "@/lib/institution-service";
import { createInstitutionAction } from "./actions";
import { InviteCoordinatorForm } from "./invite-coordinator-form";

const errorMessages: Record<string, string> = {
  duplicate: "That institution slug or code already exists.",
  invalid: "The institution could not be created. Check the required fields and try again.",
};

export default async function InstitutionsPage({ searchParams }: { searchParams: Promise<{ q?: string; error?: string; created?: string }> }) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login");
  if (actor.platformRole !== "SUPER_ADMIN") redirect("/access-denied");
  const { q = "", error = "", created = "" } = await searchParams;
  const institutions = await listInstitutions(actor, q);

  return <main className="admin-page">
    <header className="admin-topbar"><Link href="/workspace" className="admin-brand"><Image src="/brand/Black_Logo.svg" alt="Techievo" width={126} height={36} unoptimized style={{ width: 126, height: "auto" }} /></Link><div className="admin-top-actions"><span>Platform administration</span><Link className="btn" href="/workspace">Workspace</Link></div></header>
    <div className="admin-content"><div className="admin-breadcrumb">Super Admin <span>/</span> Institutions</div><div className="admin-heading"><div><div className="eyebrow">Platform administration</div><h1>Institutions</h1><p>Create institution workspaces, manage onboarding and issue coordinator invitations.</p></div><div className="heading-actions"><Link className="btn" href="/admin/students/import">Import students</Link><div className="admin-total"><Building2 size={17} /><span><strong>{institutions.length}</strong><small>Showing up to 100</small></span></div></div></div>
      {created === "1" ? <p className="admin-success" role="status">Institution created and recorded in the audit log.</p> : null}
      {errorMessages[error] ? <p className="auth-error" role="alert">{errorMessages[error]}</p> : null}
      <section className="admin-panel"><div className="admin-panel-head"><div><h2><Plus size={16} /> Create institution</h2><p>Required fields are marked. Institution identifiers must be unique.</p></div></div>
        <form action={createInstitutionAction} className="institution-form">
          <div className="form-field"><label htmlFor="institution-name">Institution name *</label><input id="institution-name" name="name" minLength={2} maxLength={180} required placeholder="e.g. Sunrise Public School" /></div>
          <div className="form-field"><label htmlFor="institution-slug">Workspace slug *</label><input id="institution-slug" name="slug" pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" minLength={2} maxLength={80} required placeholder="sunrise-public-school" /><small>Used in internal routing; saved in lowercase.</small></div>
          <div className="form-field"><label htmlFor="institution-code">Institution code</label><input id="institution-code" name="code" maxLength={40} placeholder="Optional unique code" /></div>
          <div className="form-field"><label htmlFor="institution-type">Institution type *</label><select id="institution-type" name="type" defaultValue="SCHOOL"><option value="SCHOOL">School</option><option value="COLLEGE">College</option><option value="TRAINING_INSTITUTE">Training institute</option><option value="OTHER">Other</option></select></div>
          <div className="form-field"><label htmlFor="contact-name">Primary contact</label><input id="contact-name" name="contactName" maxLength={160} placeholder="Contact person" /></div>
          <div className="form-field"><label htmlFor="contact-email">Contact email</label><input id="contact-email" name="contactEmail" type="email" maxLength={254} placeholder="office@institution.edu" /></div>
          <div className="form-field"><label htmlFor="contact-phone">Contact phone</label><input id="contact-phone" name="contactPhone" maxLength={32} placeholder="Phone number" /></div>
          <div className="form-field"><label htmlFor="academic-year">Academic year</label><input id="academic-year" name="academicYear" maxLength={32} placeholder="e.g. 2026–27" /></div>
          <div className="form-field form-field-wide"><label htmlFor="institution-address">Address</label><textarea id="institution-address" name="address" maxLength={2000} rows={2} placeholder="Institution address" /></div>
          <div className="form-field"><label htmlFor="timezone">Timezone *</label><select id="timezone" name="timezone" defaultValue="Asia/Kolkata"><option value="Asia/Kolkata">India Standard Time (Asia/Kolkata)</option><option value="UTC">UTC</option></select></div>
          <div className="form-actions"><button className="btn btn-primary" type="submit"><Plus size={14} /> Create institution</button></div>
        </form>
      </section>
      <section className="admin-panel" style={{ marginTop: 20 }}><div className="admin-panel-head admin-directory-head"><div><h2><Building2 size={16} /> Institution directory</h2><p>All records in this list are visible only to platform administrators.</p></div><form method="get" className="admin-search"><Search size={15} /><input name="q" defaultValue={q} placeholder="Search name, slug or code" aria-label="Search institutions" /><button className="btn" type="submit">Search</button></form></div>
        <div className="table-wrap"><table className="data-table admin-table"><thead><tr><th>Institution</th><th>Type</th><th>Academic year</th><th>Students</th><th>Members</th><th>Status</th></tr></thead><tbody>{institutions.length ? institutions.map((institution) => <tr key={institution.id}><td><strong>{institution.name}</strong><small className="admin-subline">{institution.code || institution.slug}</small><div className="admin-invite-cell"><InviteCoordinatorForm institutionId={institution.id} /></div></td><td>{institution.type.replaceAll("_", " ").toLowerCase()}</td><td>{institution.academicYear || "—"}</td><td><span className="admin-count"><Users size={12} />{institution._count.students}</span></td><td>{institution._count.memberships}</td><td><span className={"status " + (institution.status === "ACTIVE" ? "complete" : "pending")}><span className="status-dot" />{institution.status}</span></td></tr>) : <tr><td colSpan={6} className="admin-empty">No institutions found. Create the first institution using the form above.</td></tr>}</tbody></table></div>
      </section>
      <p className="admin-footer">Techievo LMS · Institution management · Every creation is audit-logged.</p>
    </div>
  </main>;
}
