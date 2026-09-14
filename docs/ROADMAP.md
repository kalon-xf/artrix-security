# Artrix roadmap

## Phase 0 — Foundation

- [x] Repository audit and architecture decisions
- [x] Next.js application, public site, environment validation, CI
- [x] PostgreSQL schema and tenant RLS migration

## Phase 1 — Engagement control plane

- [ ] Authentication and organization membership
- [x] Local-demo client, engagement, written authorization, scope and asset workflows
- [x] Local-demo audit logging and dashboard overview

## Phase 2 — Safe discovery

- [ ] Typed job manifests and local worker protocol
- [ ] Scope verification, cancellation, retention and parsed evidence
- [ ] Tool-version manifest and controlled job runners

## Phase 3 — Findings to closure

- [x] Local-demo findings, evidence and human validation
- [x] Markdown/PDF-ready demo reports
- [x] Local-demo remediation tasks and retests

## Phase 4 — AI red-team assessment

- [x] Local-demo benign AI test-result records
- [ ] Benign test-case library and result tracking
- [ ] Coverage reporting and safe remediation guidance

## Production gates

Before production use: integrate managed authentication, apply migrations to a managed PostgreSQL instance, configure object storage, enable rate limiting, provision signed worker identity, complete an independent security review, and exercise backups/restores.
