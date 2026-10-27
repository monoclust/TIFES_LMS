# Techievo LMS

A multi-tenant learning management system for Techievo Academic Studio and TIFES programmes.

## Product scope

The MVP covers institution administration, invitation-based account setup, role-based access, student imports, programmes and batches, classes and resources, reusable projects, GitHub URL submissions, rubric-based mentor reviews, revision history, reporting, exports, and audit logs.

### Roles

- **Super Admin** — global platform and institution administration.
- **Institution Coordinator** — manages users and learning operations within their institution.
- **Instructor** — manages assigned classes and learning resources.
- **Mentor** — reviews only assigned submissions and records rubric-based feedback.
- **Student** — accesses assigned learning, submits repository URLs, and views their own feedback.

## Architecture direction

- Next.js App Router, React, TypeScript
- Tailwind CSS and accessible Radix/shadcn-style primitives
- PostgreSQL as the source of truth
- Prisma ORM and Zod validation
- Auth.js-compatible authentication boundary
- Vitest for unit tests and Playwright for end-to-end tests

These are initial implementation decisions and must be validated against the PRD and deployment environment before production use.

## Security invariants

1. Every protected server operation authenticates the actor and authorizes the requested action.
2. Institution scope is derived from the authenticated user's membership, never trusted from a client-supplied tenant ID alone.
3. Students can read only their own submissions and feedback; mentors can access only assigned reviews.
4. Review and submission history is append-oriented; finalization and exceptional changes must be authorized and audited.
5. Production secrets and credentials must never be committed.
6. CSV/XLSX imports require validation, preview, explicit confirmation, and safe error reporting.
7. No user-supplied code is executed by the platform.

## Development status

This repository is being initialized in phases. A committed file is not evidence that the app has been built, tested, security-reviewed, or deployed. Check the commit history and the verification instructions before relying on any capability.

## Planned delivery gates

1. Requirements traceability and route inventory
2. App shell and role-specific navigation
3. Database schema and migrations
4. Authentication, invitations, and authorization
5. Core learning and review workflows
6. Reporting, auditability, and exports
7. Automated tests, accessibility, and deployment readiness

## Local setup

1. Install Node.js 22 and PostgreSQL.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`; set a local `DATABASE_URL`, a unique `AUTH_SECRET`, and `AUTH_URL=http://localhost:3000`.
4. Run `npm run db:generate`.
5. With a local development database only, run `npx prisma migrate dev --name init` and commit the generated migration files.
6. Create the first platform administrator once, using environment variables rather than command-line literals saved in shell history: `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, and `BOOTSTRAP_ADMIN_PASSWORD` (minimum 16 characters), then run `npm run admin:bootstrap`. The script refuses to overwrite an existing account.
7. Run `npm run dev`.

Verification commands: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

## Current limitations

- The root route is an explicitly labelled UI preview with sample data; it is not a live operational dashboard.
- The login and invitation/account-setup paths are implemented, but rate limiting, password-reset delivery, privileged-user MFA and a full security review remain launch gates.
- The invitation endpoint returns a one-time link; it does not send email yet.
- Role/resource policy helpers exist, but every data route must still be wired to them and tested for tenant isolation.
- Database migrations must be generated and reviewed against a real development database before deployment.

Never run production migrations until a backup and rollback plan is confirmed.
