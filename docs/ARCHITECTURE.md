# Artrix architecture

## Product boundary

Artrix manages authorized application-security and AI red-team engagements. It coordinates scope approval, safe discovery, human validation, reporting, remediation, and retesting. It is not an unrestricted scanning or exploitation platform.

## System overview

```
Browser UI → Next.js server routes → tenant-aware data layer → PostgreSQL
                                      ↘ audit log
                                      ↘ approved-job queue → local worker
                                      ↘ Superhuman graph → evidence memory
```

Every job is represented by a typed manifest. The worker accepts only an allowlisted job type and allowlisted arguments after server-side authorization, scope, rate-limit, and testing-window checks. It never accepts user-supplied shell commands.

## Runtime layers

- **Next.js App Router**: public marketing pages and authenticated workspace.
- **Server routes**: Zod-validated actions, role checks, tenant isolation, CSRF-safe same-origin patterns.
- **PostgreSQL**: relational source of truth with row-level security policies.
- **Local worker**: development-only manifest processor. Production workers require mTLS or a signed service token, job signatures, and egress allowlisting.
- **Object storage**: raw output and evidence outside the primary database, with references, retention controls, and encryption-ready configuration.

## Authorization gate

A job can progress to `queued` only when all conditions are true:

1. The actor belongs to the engagement organization and has permission.
2. The engagement has written authorization marked approved.
3. The scope is approved and active during the testing window.
4. Every target is in an approved asset/scope record and not excluded.
5. The requested job type is allowed by the scope.
6. Rate limits and timeout are within the approved limits.

## Tenant model

All records carry `organization_id`. Child records are reachable only through tenant-owned parents. Database RLS policies use membership checks; server routes additionally enforce the active organization context and role permissions.

## Roles

| Role | Primary capabilities |
| --- | --- |
| Platform Admin | Platform administration and support-only audit access |
| Organization Owner | Organization, members, billing, all workspace actions |
| Security Lead | Engagement approval, validation, reports, remediation oversight |
| Researcher | Scoped asset discovery, draft findings, evidence |
| Client Viewer | Read-only client workspace and approved reports |
| Engineering / Remediation Member | Remediation tasks, fix evidence, comments |

## Data domains

Organizations, memberships, clients, engagements, authorizations, scopes, assets, jobs, job_runs, evidence, findings, reports, remediation_tasks, retests, audit_logs, ai_systems, ai_test_cases, and ai_test_runs.

## Security controls

- Input validation with Zod at API boundaries.
- No secrets in source; validated environment variables.
- Secure headers and non-sensitive structured logs.
- Explicit demo mode only in development.
- Audit events for authorization, scope, job, finding validation, report export, remediation, and retest actions.
- Sanitized evidence UI; raw request/response content is not displayed by default.

## AIFIX3R Superhuman boundary

The Superhuman planner can create a mission graph, recall evidence-linked memory, and form candidate hypotheses. It cannot grant itself execution authority. Scope checks happen outside the model, workers accept typed manifests only, and a security lead must approve a bounded validation plan. Pattern similarity and model confidence never convert a candidate into a validated finding.
