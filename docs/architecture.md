# Techievo LMS architecture baseline

## Logical architecture

```text
Browser / responsive role workspace
            |
            v
Next.js App Router (UI and server entry points)
            |
            v
Application services + Zod validation
            |
            +--> Authentication/session verification
            +--> Role and resource authorization
            +--> Institution membership scope
            +--> Audit event recording
            |
            v
Prisma data access --> PostgreSQL (source of truth)
            |
            +--> Optional object storage for approved uploads
            +--> Optional email delivery for invitations/reset
            +--> External Zoom/GitHub links (not code execution)
```

## Architectural rules

- Server components and client components are presentation boundaries, not security boundaries.
- All mutations must use a server-only service/action/route that validates input and authorizes the actor before changing data.
- Institution-scoped queries must include a server-derived institution scope. Never accept a client-supplied institution ID as proof of access.
- Use explicit DTOs rather than returning database records indiscriminately.
- Use transactions for imports and multi-record workflow transitions.
- Audit sensitive actions with actor, action, target, timestamp and safe metadata. Do not store credentials, invitation tokens or unnecessary personal data in logs.
- Keep submission versions and review decisions as history; corrections to finalized outcomes require a controlled, audited path.
- Use a transactional outbox or equivalent durable queue if notification delivery becomes asynchronous; do not pretend an email was sent when it was not.
- Do not run student-submitted code on the application server.

## Initial stack proposal

Next.js App Router, React, TypeScript, Tailwind CSS, Lucide icons, PostgreSQL, Prisma, Zod, Auth.js-compatible authentication, Vitest and Playwright. Confirm exact versions, authentication adapter compatibility, hosting limits, email delivery and database connection pooling before production release.

## Environment boundaries

- Local development uses a developer-owned database and `.env.local`.
- CI uses isolated test configuration and no production secrets.
- Preview and production environments use separately managed credentials and databases.
- Production migrations require a backup, reviewed migration plan and rollback/forward-fix procedure. No production deploy or destructive migration without explicit approval.

## Current status

This is an architecture baseline, not a deployed topology. The first UI shell uses clearly labelled illustrative data and has no production authentication or database connection.
