# Techievo LMS route inventory

**Status:** Source-derived route inventory from the supplied Page Architecture & Workflow Specification and PRD. Routes are planned, not all implemented.

## Authentication and account access

| Route | Purpose | State |
|---|---|---|
| `/login` | Authenticate and route to permitted workspace | Planned |
| `/reset-password` | Secure account recovery | Planned |
| `/accept-invitation` | Validate an invitation and continue to setup | Planned |
| `/account-setup` | Complete initial profile and security configuration | Planned |
| `/access-denied` | Explain permission denial without exposing resource details | Planned |

## Super Admin

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Platform-wide operational metrics and alerts |
| `/admin/institutions` | Search, create and manage institutions |
| `/admin/institutions/[id]` | Institution profile, status and associated users |
| `/admin/coordinators` | Invite and manage coordinators |
| `/admin/students` | Authorized student directory |
| `/admin/students/[id]` | Student profile and enrollment history |
| `/admin/students/import` | Import validation, preview, error export and commit |
| `/admin/batches` | Batch and enrollment management |
| `/admin/programmes` | Programme configuration |
| `/admin/courses` | Course definitions and associations |
| `/admin/classes` | Class sessions, schedules, resources and links |
| `/admin/projects` | Reusable project briefs and rubrics |
| `/admin/assignments` | Assign projects to batches or individual learners |
| `/admin/mentors` | Mentor records and assignment permissions |
| `/admin/reports` | Platform-level analytics and exports |
| `/admin/audit-logs` | Privileged and sensitive event history |
| `/admin/settings` | Platform configuration |

## Institution Coordinator

| Route | Purpose |
|---|---|
| `/coordinator/dashboard` | Institution progress, upcoming classes and project status |
| `/coordinator/students` | Institution roster and student profiles |
| `/coordinator/students/import` | Validated roster import |
| `/coordinator/students/[id]` | Permitted individual learning progress |
| `/coordinator/batches` | Batch and enrollment management |
| `/coordinator/batches/[id]` | Roster, scheduled classes and project status |
| `/coordinator/classes` | Upcoming, completed and cancelled sessions |
| `/coordinator/projects` | Project status, submissions and revision states |
| `/coordinator/reports` | Institution-scoped reporting and exports |

## Student

| Route | Purpose |
|---|---|
| `/student/dashboard` | Next class, active assignments, feedback and progress |
| `/student/classes` | Assigned class sessions |
| `/student/classes/[id]` | Session details, Zoom link and resources |
| `/student/assignments` | Assigned work and deadlines |
| `/student/assignments/[id]` | Project brief, deliverables and rubric |
| `/student/submissions` | Submission versions and current status |
| `/student/submissions/[id]` | Repository URL, timestamps and allowed feedback |
| `/student/feedback` | Mentor comments, rubric results and revision requests |
| `/student/profile` | Permitted profile fields |

## Mentor

| Route | Purpose |
|---|---|
| `/mentor/dashboard` | Pending, overdue, revision and completed review counts |
| `/mentor/review-queue` | Filterable queue of assigned submissions |
| `/mentor/submissions/[id]` | Submitted repository and project requirements |
| `/mentor/reviews/[id]` | Rubric scoring, feedback, revision request or authorized finalization |
| `/mentor/history` | Completed assessments and revision cycles |

## Instructor

The source specifies instructor capabilities but does not provide a complete route list. Proposed routes to validate during detailed design:

- `/instructor/dashboard`
- `/instructor/classes`
- `/instructor/classes/[id]`
- `/instructor/resources`
- `/instructor/profile`

These proposed routes must be reconciled with the final navigation specification before implementation.

## Route-level requirements

- Authentication does not imply authorization to every institution or resource.
- Each route must enforce server-side access checks in addition to role-filtered navigation.
- Institution-scoped list, detail, export and mutation handlers must use a trusted server-derived institution scope.
- Direct access to another tenant's identifier must not disclose whether a private record exists.
- Breadcrumbs and back navigation should preserve relevant filters where applicable.
- Dates and times display in the institution's configured timezone; default timezone is Asia/Kolkata.
- Empty, loading, validation, permission-denied and error states must be designed for each data-backed page.

## Current implementation

Only the root route `/` currently exists as a responsive dashboard shell with explicitly illustrative data. The routes listed above are not yet implemented or connected to authentication/data.
