# Requirements traceability baseline

**Status:** Initial baseline derived from the Techievo LMS PRD and the LMS implementation brief. This document is not a sign-off that the requirements have been implemented.

## Source hierarchy

1. Explicit user requirements for this build
2. `Techievo_LMS_PRD.html`
3. Supplied page architecture and workflow requirements
4. `TECHIEVO_Strategy_and_Impact_Interactive.html`
5. Supplied brand assets
6. Existing repository conventions
7. Documented professional judgment where sources are silent

Record conflicts before implementation. Do not silently replace source requirements with assumptions.

## Functional traceability

| ID | Capability | Acceptance evidence required | Status |
|---|---|---|---|
| AUTH-01 | Invitation acceptance and account setup | Expiring single-use invitation; token stored as a hash; invalid/expired/replayed token tests | Partial: token inspection, transactional acceptance and password setup implemented; delivery not connected |
| AUTH-02 | Authentication and session controls | Protected server routes/actions; session revocation; suspended account denied | Partial: email/password credentials and status/authVersion checks implemented; reset delivery, rate limiting and MFA remain open |
| RBAC-01 | Role-based access | Server-side role and resource authorization tests for every role | Partial: pure policy helper and unit tests exist; comprehensive route enforcement is not implemented |
| TEN-01 | Institution isolation | Cross-tenant read/write tests for every institution-scoped resource | Not implemented |
| INST-01 | Institution lifecycle | Super Admin create/update/suspend; sensitive actions audited | Not implemented |
| USER-01 | Coordinator and staff invitations | Role-limited invitations, expiry, resend/revoke and audit history | Not implemented |
| STUD-01 | Student directory | Institution-scoped CRUD, enrollment history, student/account linking | Not implemented |
| IMP-01 | CSV/XLSX import | Upload validation, preview, duplicate detection, row errors, explicit commit and rollback | Not implemented |
| LEARN-01 | Programmes and batches | Institution-scoped configuration and enrollment integrity | Not implemented |
| CLASS-01 | Classes and resources | Assigned instructor permissions, safe resource links/files | Not implemented |
| PROJ-01 | Reusable projects and assignments | Project templates, batch assignments, rubric versioning and deadlines | Not implemented |
| SUB-01 | Repository URL submissions | URL validation, version history, no arbitrary code execution, ownership checks | Not implemented |
| REV-01 | Mentor reviews | Assigned-submission access, criterion scores, revision requests and finalization rules | Not implemented |
| HIST-01 | Submission/review history | Append-oriented versions and review decisions; finalization auditable | Not implemented |
| REPORT-01 | Operational reports and exports | Documented metric definitions; CSV/XLSX export; tenant-scoped queries | Not implemented |
| AUD-01 | Audit log | Actor/action/target/time and safe metadata for privileged actions | Not implemented |
| OPS-01 | Backup and recovery | Documented backup schedule, restore procedure, and verified restore exercise | Not implemented |
| A11Y-01 | Accessible responsive UI | Keyboard navigation, focus visibility, labels, semantic structure and viewport tests | In progress: initial shell only |

## Roles and boundaries

- **Super Admin:** global institution and platform administration. Privileged operations must be audited.
- **Institution Coordinator:** manages authorized institution records, students, imports, batches, classes, projects and reports. No access to other institutions. Finalized review scores are not editable by default.
- **Instructor:** manages assigned classes and learning resources only.
- **Mentor:** accesses assigned submissions and records reviews only.
- **Student:** accesses assigned learning, their own submissions, versions, feedback and scores only.
- **Institution Viewer:** optional and read-only; include only if explicitly approved and documented.

A role name in the UI is not authorization. The server must enforce permissions on every protected operation.

## Required end-to-end workflow

1. Super Admin creates an institution and invites its coordinator.
2. Coordinator accepts the invitation, completes account setup and configures the institution.
3. Coordinator imports or creates student records, reviews validation results and confirms the import.
4. Coordinator assigns programmes, batches, classes and projects.
5. Instructor maintains assigned classes and learning resources.
6. Student submits a repository URL for an assigned project; each resubmission creates a new version.
7. Assigned mentor reviews against the rubric, provides feedback and requests revisions or finalizes the review.
8. Student views feedback and resubmits where permitted; previous versions and review decisions remain available.
9. Authorized staff review metrics and export reports; totals reconcile with underlying records.

## Metric definitions to preserve

- **Submission rate:** eligible assigned students with at least one submission / eligible assigned students.
- **Review completion:** submitted eligible assignments with a completed review / submitted eligible assignments.
- **Revision backlog:** count of submissions by revision/review status, respecting the current workflow state.
- **Average score:** average of finalized scores with a stated denominator and scoring normalization.
- **Overdue work:** assignments past the effective deadline, including approved extensions.

All metrics must define their denominator, date window, tenant scope and handling of withdrawn/ineligible records.

## Explicit non-goals unless approved

Native mobile apps; proprietary video hosting; arbitrary code execution or automated grading; a complete examination system; fees, payroll or ERP; a course marketplace; automated certificates; Zoom attendance API integration.

## Security and privacy gates

- Derive institution access from authenticated membership and resource relationships.
- Validate input on the server; use safe, allowlisted file types and size limits for imports/resources.
- Keep secrets server-side; use HTTPS in production; never ask students for GitHub access tokens.
- Do not execute submitted repository code.
- Minimize personal data, define retention/deletion, and review applicable privacy and guardian-consent obligations for minors before production launch.
- Back up data and test restore before claiming recovery readiness.

## Unresolved decisions

1. Student login identifier: email, institution-issued ID, or both.
2. Who may finalize mentor reviews, and whether a second approval is required.
3. Deadline and extension precedence: project default, batch override, or individual extension.
4. Production hosting, email delivery provider, object storage and database provider.
5. Whether private GitHub repositories need integration; default is URL-only submission with no token collection.
6. Data retention, deletion/export policy and consent process for minors.

Do not block the public UI foundation on these decisions; do block production authentication, invitation delivery and policy-sensitive workflows until resolved.
