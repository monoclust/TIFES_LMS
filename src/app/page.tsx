"use client";

import { useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowRight, Bell, BookOpen, BriefcaseBusiness,
  CalendarDays, ChartNoAxesCombined, CheckCheck, ChevronDown, CircleHelp,
  ClipboardCheck, Clock3, Command, FileText, GraduationCap, LayoutDashboard,
  Menu, Plus, Search, Settings2, ShieldCheck, Users, X,
} from "lucide-react";

type NavItem = { label: string; icon: typeof LayoutDashboard; active?: boolean };
const mainNav: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Institutions", icon: BriefcaseBusiness },
  { label: "Students", icon: Users },
  { label: "Programmes & batches", icon: GraduationCap },
  { label: "Classes & resources", icon: BookOpen },
  { label: "Projects & assignments", icon: ClipboardCheck },
  { label: "Mentor reviews", icon: CheckCheck },
];
const manageNav: NavItem[] = [
  { label: "Reports & analytics", icon: ChartNoAxesCombined },
  { label: "Audit log", icon: ShieldCheck },
  { label: "Settings", icon: Settings2 },
];
const activities = [
  { icon: Users, title: "Student import prepared", detail: "Institution roster · Preview required before commit", time: "Today", tone: "pending" },
  { icon: ClipboardCheck, title: "Project review queue", detail: "Submissions awaiting an assigned mentor", time: "Today", tone: "review" },
  { icon: BookOpen, title: "Class resources updated", detail: "Instructor workspace · Resource changes", time: "Yesterday", tone: "complete" },
];
const students = [
  { initials: "AR", name: "Aarav Rao", id: "STU-EXAMPLE-001", programme: "Data & AI Builder", progress: 78, status: "In progress" },
  { initials: "SM", name: "Sara Mishra", id: "STU-EXAMPLE-002", programme: "Computational Builder", progress: 92, status: "On track" },
  { initials: "DK", name: "Dev Kumar", id: "STU-EXAMPLE-003", programme: "AI Product Engineer", progress: 54, status: "Needs review" },
];
const barData = [
  { month: "May", assigned: 48, reviewed: 30 }, { month: "Jun", assigned: 60, reviewed: 43 },
  { month: "Jul", assigned: 52, reviewed: 39 }, { month: "Aug", assigned: 76, reviewed: 55 },
  { month: "Sep", assigned: 68, reviewed: 51 }, { month: "Oct", assigned: 86, reviewed: 63 },
];

function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const renderItems = (items: NavItem[]) => items.map((item) => {
    const Icon = item.icon;
    return <a key={item.label} href={item.active ? "#overview" : "#coming-next"} onClick={onNavigate} className={`nav-item ${item.active ? "active" : ""}`} aria-current={item.active ? "page" : undefined}>
      <span className="nav-icon"><Icon size={17} strokeWidth={1.8} /></span><span>{item.label}</span>{item.active ? <span style={{ marginLeft: "auto", fontSize: 9 }}>●</span> : null}
    </a>;
  });
  return <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
    <a className="brand" href="#overview" aria-label="Techievo LMS home" onClick={onNavigate}>
      <span className="brand-mark">T.</span><span><span className="brand-name">techievo</span><span className="brand-sub" style={{ display: "block" }}>Learning platform</span></span>
    </a>
    <div className="tenant-switch"><small>Workspace</small><strong>Platform operations</strong><span>Super Admin view</span></div>
    <nav aria-label="Main navigation"><div className="nav-label">Workspace</div><div className="nav-list">{renderItems(mainNav)}</div><div className="nav-label" style={{ marginTop: 24 }}>Insights & control</div><div className="nav-list">{renderItems(manageNav)}</div></nav>
    <div className="sidebar-bottom"><div className="support-card"><strong>Need a hand?</strong><p>Review the workflow and access rules before onboarding your first institution.</p><a href="#delivery-notes" onClick={onNavigate}>Read delivery notes ↗</a></div><div className="profile-mini"><div className="avatar" style={{ background: "#f5c400" }}>SA</div><div><strong>Super Admin</strong><small>Local preview · not signed in</small></div><ChevronDown size={14} style={{ marginLeft: "auto", color: "#aaa" }} /></div></div>
  </aside>;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredStudents = students.filter((student) => `${student.name} ${student.id} ${student.programme}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="app-shell" id="overview">
    <Sidebar />
    {menuOpen ? <div className="mobile-drawer"><Sidebar mobile onNavigate={() => setMenuOpen(false)} /></div> : null}
    <div className="main-area">
      <header className="topbar"><div style={{ display: "flex", alignItems: "center", gap: 12 }}><button className="icon-button mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>{menuOpen ? <X size={17} /> : <Menu size={17} />}</button><div className="crumb">Workspace <span style={{ margin: "0 8px", color: "#bbb" }}>/</span><strong>Overview</strong></div></div>
        <div className="topbar-actions"><label className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sample students…" aria-label="Search sample students" /></label><button className="icon-button" aria-label="Notifications (preview only)" title="Notifications are not connected yet"><Bell size={16} /></button><div className="avatar" style={{ width: 32, height: 32, background: "#f5c400" }}>SA</div></div>
      </header>
      <main className="main-content">
        <div className="page-heading"><div><div className="eyebrow">Platform operations</div><h1>Learning operations, at a glance.</h1><p>Monitor institution setup, learning activity, and review throughput from one workspace.</p></div><div className="heading-actions"><button className="btn" onClick={() => window.print()}><ArrowDownToLine size={14} /> Export view</button><a className="btn btn-primary" href="#quick-actions"><Plus size={15} /> Create workspace item</a></div></div>
        <div className="sample-note" role="note"><span className="sample-dot" /><span><strong>UI foundation preview.</strong> All names, counts, activity and chart values below are illustrative sample data. Authentication, database-backed metrics and write actions are not connected yet.</span></div>
        <section className="metrics-grid" aria-label="Illustrative platform metrics">
          <Metric title="Institutions" value="08" foot="Sample workspaces" icon={<BriefcaseBusiness size={16} />} />
          <Metric title="Learner records" value="1,284" foot="Illustrative roster count" icon={<Users size={16} />} />
          <Metric title="Open submissions" value="146" foot="Sample review workload" icon={<ClipboardCheck size={16} />} />
          <Metric title="Review completion" value="82%" foot="Illustrative completion rate" icon={<ChartNoAxesCombined size={16} />} />
        </section>
        <section className="content-grid">
          <article className="panel"><div className="panel-head"><div><h2>Learning activity</h2><p>Assignments created vs. reviews completed</p></div><span className="status complete"><span className="status-dot" />Sample trend</span></div><div className="panel-body"><div className="chart-legend"><span><i className="legend-key" style={{ background: "#f5c400" }} />Assignments</span><span><i className="legend-key" style={{ background: "#242424" }} />Reviews completed</span></div><div className="bar-chart" role="img" aria-label="Illustrative bar chart showing assignments and reviews from May through October"><div className="chart-gridlines" />{barData.map((item) => <div className="bar-month" key={item.month}><div className="bar-pair"><div className="bar" style={{ height: `${item.assigned / 90 * 100}%` }} title={`${item.assigned} sample assignments`} /><div className="bar secondary" style={{ height: `${item.reviewed / 90 * 100}%` }} title={`${item.reviewed} sample reviews`} /></div><span>{item.month}</span></div>)}</div><div className="chart-caption"><span>Illustrative monthly activity</span><span>Values are not live</span></div></div></article>
          <article className="panel"><div className="panel-head"><div><h2>Recent activity</h2><p>Example operational events</p></div><Activity size={16} color="#777" /></div><div className="panel-body"><div className="activity-list">{activities.map((activity) => { const Icon = activity.icon; return <div className="activity-row" key={activity.title}><div className="activity-mark"><Icon size={15} /></div><div className="activity-copy"><strong>{activity.title}</strong><p>{activity.detail}</p><div style={{ marginTop: 7 }}><span className={`status ${activity.tone}`}><span className="status-dot" />{activity.tone === "pending" ? "Needs confirmation" : activity.tone === "review" ? "Queue preview" : "Example event"}</span></div></div><span className="activity-time">{activity.time}</span></div>; })}</div></div></article>
        </section>
        <section className="panel" style={{ marginBottom: 18 }}><div className="panel-head"><div><h2>Student directory preview</h2><p>Example records only · production directory will be tenant-scoped</p></div><a className="text-link" href="#delivery-notes">View data safeguards</a></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Learner</th><th>Programme</th><th>Progress</th><th>Status</th></tr></thead><tbody>{filteredStudents.length ? filteredStudents.map((student) => <tr key={student.id}><td><div className="student-cell"><div className="avatar">{student.initials}</div><div><strong>{student.name}</strong><small>{student.id}</small></div></div></td><td>{student.programme}</td><td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div className="progress-track" aria-label={`${student.progress}% sample progress`}><div className="progress-fill" style={{ width: `${student.progress}%` }} /></div><span>{student.progress}%</span></div></td><td><span className={`status ${student.status === "On track" ? "complete" : student.status === "Needs review" ? "review" : "pending"}`}><span className="status-dot" />{student.status}</span></td></tr>) : <tr><td colSpan={4} style={{ textAlign: "center", padding: 28, color: "#777" }}>No sample records match “{query}”.</td></tr>}</tbody></table></div></section>
        <section id="quick-actions"><div className="page-heading" style={{ marginBottom: 13 }}><div><div className="eyebrow">Workflow entry points</div><h2 style={{ fontSize: 17, letterSpacing: "-.4px", margin: "5px 0" }}>What would you like to manage?</h2></div></div><div className="bottom-grid"><QuickAction icon={<Users size={17} />} title="Set up an institution" detail="Institution profile, coordinator invitation and access boundaries." /><QuickAction icon={<FileText size={17} />} title="Prepare a student import" detail="CSV/XLSX validation, duplicate checks and preview before commit." /><QuickAction icon={<ClipboardCheck size={17} />} title="Review project submissions" detail="Assignment queues, rubric feedback and revision history." /></div></section>
        <section id="delivery-notes" className="panel" style={{ marginTop: 18 }}><div className="panel-head"><div><h2>Implementation guardrails</h2><p>Conditions for moving from UI preview to a usable LMS</p></div><CircleHelp size={16} color="#777" /></div><div className="panel-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}><Guardrail title="Tenant isolation" detail="Resolve institution membership server-side on every protected read and write." /><Guardrail title="Traceable review history" detail="Keep each submission version and review decision; don't silently overwrite finalized records." /><Guardrail title="Operational truth" detail="Metrics must be derived from persisted records and documented denominators, not demo constants." /><Guardrail title="Safe onboarding" detail="Invitation expiry, session revocation, role checks and import validation are required before live users." /></div></section>
        <p className="footer-note">Techievo LMS · Foundation milestone · IST-ready display strategy · Not production-ready</p>
      </main>
    </div>
  </div>;
}

function Metric({ title, value, foot, icon }: { title: string; value: string; foot: string; icon: React.ReactNode }) {
  return <article className="metric-card"><div className="metric-top"><span>{title}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}</div><div className="metric-foot">{foot}</div></article>;
}
function QuickAction({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <a href="#delivery-notes" className="quick-card"><span className="quick-icon">{icon}</span><span><strong>{title}</strong><p>{detail}</p></span><ArrowRight className="quick-arrow" size={16} /></a>;
}
function Guardrail({ title, detail }: { title: string; detail: string }) {
  return <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}><span style={{ color: "#9a7800", marginTop: 2 }}><ShieldCheck size={16} /></span><div><strong style={{ fontSize: 11 }}>{title}</strong><p style={{ margin: "4px 0 0", color: "#777", fontSize: 10, lineHeight: 1.6 }}>{detail}</p></div></div>;
}
