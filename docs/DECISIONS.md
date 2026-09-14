# Architecture decisions

## ADR-001: New original repository

**Decision:** Use `kalon-xf/artrix-security` as a clean Artrix repository.

**Reason:** The repository was empty and the owner confirmed that xalgorix is not the source repository.

## ADR-002: Authorization-first jobs

**Decision:** Discovery runs are created from typed job manifests rather than arbitrary user commands.

**Reason:** This prevents command injection, accidental destructive testing, and testing outside written authorization.

## ADR-003: Demo mode is development-only

**Decision:** The initial UI may use clearly marked in-memory demo data only when `ARTRIX_DEMO_MODE=true` and `NODE_ENV=development`.

**Reason:** Production must never expose default credentials or demo tenant data.

## ADR-004: Human validation gate

**Decision:** Findings cannot transition to `validated` automatically.

**Reason:** Automated discovery signals require human review before a customer-facing security conclusion is made.

## ADR-005: Database-enforced tenancy

**Decision:** Tenant isolation is enforced by both application checks and PostgreSQL RLS policies.

**Reason:** Defense in depth reduces the impact of an application-layer authorization mistake.
