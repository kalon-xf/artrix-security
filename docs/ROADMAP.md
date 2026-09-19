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

- [x] Typed job manifests and local worker protocol
- [x] Scan-console visibility for authorization, exclusions, rate limits, and the safe methodology
- [ ] Scope verification, cancellation, retention and parsed evidence in a signed local worker
- [ ] Tool-version manifest and controlled job runners
- [ ] Authenticated local WebSocket telemetry; no telemetry binding beyond loopback by default

## Phase 3 — Findings to closure

- [x] Local-demo findings, evidence and human validation
- [x] Markdown/PDF-ready demo reports
- [x] Local-demo remediation tasks and retests

## Phase 4 — AI red-team assessment

- [x] Local-demo benign AI test-result records
- [ ] Benign test-case library and result tracking
- [ ] Coverage reporting and safe remediation guidance

## Phase 5 — Self-hosted runtime

- [ ] BYO-provider configuration with server-only secret storage and per-organization rate/cost limits
- [ ] Optional notification integrations with opt-in, least-privilege credentials, and audit records
- [ ] Branded PDF rendering, object storage, and safe report download controls

## Phase 6 — AIFIX3R Superhuman

- [x] Six-fact deny-by-default mission authorization gate
- [x] Inspectable 22-phase task-graph vertical slice
- [x] Evidence-linked candidate hypotheses and explicit missing-evidence state
- [x] Security-lead validation-plan checkpoint
- [x] PostgreSQL/pgvector-ready mission, task, memory, hypothesis, and approval schema
- [ ] Structured-output BYO LLM planner with organization cost limits
- [ ] Bounded AIFIX3R pattern-card retrieval and citation
- [ ] Signed worker execution, cancellation re-check, and append-only evidence integrity
- [ ] Human-validated memory promotion and independent verifier workflow

## Production gates

Before production use: integrate managed authentication, apply migrations to a managed PostgreSQL instance, configure object storage, enable rate limiting, provision signed worker identity, complete an independent security review, and exercise backups/restores.
