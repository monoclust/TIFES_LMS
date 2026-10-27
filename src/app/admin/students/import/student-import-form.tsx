"use client";

import { useState } from "react";
import { ArrowUpFromLine, CheckCircle2, Download, FileSpreadsheet, RefreshCw } from "lucide-react";

type InstitutionOption = { id: string; name: string; code: string | null; slug: string };
type Preview = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  preview: Array<{ row: number; studentCode: string; name: string; email: string; programmeCode: string; batchCode: string; status: string }>;
};
type CommitResult = { imported: number; enrolled: number; totalRows: number; invalidRows: number; errors: Array<{ row: number; field: string; message: string }> };

export function StudentImportForm({ institutions }: { institutions: InstitutionOption[] }) {
  const [institutionId, setInstitutionId] = useState(institutions[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<CommitResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(mode: "preview" | "commit") {
    if (!institutionId || !file) {
      setError("Choose an institution and a CSV/XLSX file first.");
      return;
    }
    setBusy(true);
    setError("");
    if (mode === "preview") setResult(null);
    try {
      const form = new FormData();
      form.set("mode", mode);
      form.set("file", file);
      const response = await fetch("/api/institutions/" + encodeURIComponent(institutionId) + "/students/import", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "The import request failed.");
        return;
      }
      if (mode === "preview") {
        setPreview(payload as Preview);
      } else {
        setResult(payload as CommitResult);
        setPreview(null);
      }
    } catch {
      setError("The service could not be reached. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function downloadErrors() {
    const errors = result?.errors ?? preview?.errors ?? [];
    if (!errors.length) return;
    const escapeCell = (value: string | number) => '"' + String(value).replace(/"/g, '""') + '"';
    const csv = ["row,field,message", ...errors.map((item) => [item.row, item.field, item.message].map(escapeCell).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "student-import-errors.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="import-workspace">
    <section className="import-panel"><div className="import-panel-title"><span className="import-icon"><FileSpreadsheet size={18} /></span><div><h2>Upload student roster</h2><p>CSV or XLSX · Maximum 5 MB and 5,000 rows per import</p></div></div>
      <div className="import-form-grid"><div className="form-field"><label htmlFor="import-institution">Institution *</label><select id="import-institution" value={institutionId} onChange={(event) => { setInstitutionId(event.target.value); setPreview(null); setResult(null); }} required>{institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}{institution.code ? " · " + institution.code : ""}</option>)}</select></div><div className="form-field"><label htmlFor="import-file">Roster file *</label><input id="import-file" type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setPreview(null); setResult(null); }} required /></div></div>
      <div className="import-columns"><strong>Required columns</strong><code>studentCode, name</code><strong>Optional columns</strong><code>email, phone, programmeCode, batchCode, status</code><p>Status values: ACTIVE, INACTIVE, WITHDRAWN, ARCHIVED. Programme and batch codes must already exist in the selected institution. Student accounts are not created by roster import.</p></div>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <div className="import-actions"><a className="btn" href="/templates/student-import-template.csv" download><Download size={14} /> Download template</a><button className="btn btn-primary" type="button" onClick={() => send("preview")} disabled={busy || !institutions.length}>{busy ? "Processing…" : <><ArrowUpFromLine size={14} /> Validate & preview</>}</button></div>
    </section>
    {preview ? <section className="import-panel import-results"><div className="import-panel-title"><span className="import-icon"><CheckCircle2 size={18} /></span><div><h2>Import preview</h2><p>Review the validation results before committing records.</p></div></div><div className="import-summary"><div><strong>{preview.totalRows}</strong><span>Rows scanned</span></div><div><strong>{preview.validRows}</strong><span>Valid rows</span></div><div><strong>{preview.invalidRows}</strong><span>Rows with errors</span></div></div>{preview.errors.length ? <div className="import-errors"><div className="import-errors-head"><strong>Validation errors</strong><button className="btn" type="button" onClick={downloadErrors}><Download size={13} /> Download errors</button></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Row</th><th>Field</th><th>Issue</th></tr></thead><tbody>{preview.errors.map((item,index)=><tr key={item.row + "-" + item.field + "-" + index}><td>{item.row}</td><td>{item.field}</td><td>{item.message}</td></tr>)}</tbody></table></div></div>:<p className="import-clean">No validation errors found.</p>}<div className="import-actions"><button className="btn" type="button" onClick={() => send("preview")} disabled={busy}><RefreshCw size={13} /> Revalidate file</button><button className="btn btn-primary" type="button" onClick={() => send("commit")} disabled={busy || preview.validRows === 0}>{busy ? "Processing…" : "Import " + preview.validRows + " valid rows"}</button></div><p className="import-warning">Commit revalidates the file on the server. Valid rows are imported in one transaction; invalid rows are skipped and reported.</p></section> : null}
    {result ? <section className="import-panel import-results"><div className="import-panel-title"><span className="import-icon"><CheckCircle2 size={18} /></span><div><h2>Import completed</h2><p>Results are based on records committed to the database.</p></div></div><div className="import-summary"><div><strong>{result.imported}</strong><span>Students imported</span></div><div><strong>{result.enrolled}</strong><span>Enrollments created</span></div><div><strong>{result.invalidRows}</strong><span>Rows with errors</span></div></div>{result.errors.length ? <><div className="import-errors-head"><strong>Rows not imported</strong><button className="btn" type="button" onClick={downloadErrors}><Download size={13} /> Download errors</button></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Row</th><th>Field</th><th>Issue</th></tr></thead><tbody>{result.errors.map((item,index)=><tr key={item.row + "-" + item.field + "-" + index}><td>{item.row}</td><td>{item.field}</td><td>{item.message}</td></tr>)}</tbody></table></div></>:<p className="import-clean">All valid rows were imported successfully.</p>}<div className="import-actions"><button className="btn" type="button" onClick={() => { setFile(null); setPreview(null); setResult(null); }}><RefreshCw size={13} /> Start another import</button></div></section>:null}
  </div>;
}
