# Artrix roadmap

## Phase 0 — Foundation

- [x] Repository audit and architecture decisions
- [ ] Next.js application, public site, environment validation, CI
- [ ] PostgreSQL schema and tenant RLS migration

## Phase 1 — Engagement control plane

- [ ] Authentication and organization membership
- [ ] Client, engagement, written authorization, scope and asset workflows
- [ ] Audit logging and dashboard overview

## Phase 2 — Safe discovery

- [ ] Typed job manifests and local worker protocol
- [ ] Scope verification, cancellation, retention and parsed evidence
- [ ] Tool-version manifest and controlled job runners

## Phase 3 — Findings to closure

- [ ] Findings, evidence, duplicate review and human validation
- [ ] Markdown/PDF-ready reports
- [ ] Remediation tasks, client comments, retests and closure

## Phase 4 — AI red-team assessment

- [ ] AI system inventory and threat model
- [ ] Benign test-case library and result tracking
- [ ] Coverage reporting and safe remediation guidance

## Production gates

Before production use: integrate managed authentication, apply migrations to a managed PostgreSQL instance, configure object storage, enable rate limiting, provision signed worker identity, complete an independent security review, and exercise backups/restores.
