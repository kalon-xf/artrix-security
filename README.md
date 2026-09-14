# Artrix

**Find. Prove. Fix. Verify.**

Artrix is an India-first professional platform for managing explicitly authorized application-security and AI red-team engagements—from scope approval through discovery, findings, reports, remediation, and retesting.

> **Authorized security testing only.**

## Current foundation

- Premium dark public website for services, AI red-team, API authorization, RAG/agent security, about, and assessment requests.
- Development-only local demo workspace with an approval-gated engagement workflow.
- Safe job-manifest design: no arbitrary shell commands, no unrestricted scanning, and no job outside approved scope.
- PostgreSQL/Supabase migration foundation with organization tenancy and RLS.
- Docker, CI, tests, architecture documentation, and deployment guidance.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

See [Local setup](docs/LOCAL_SETUP.md), [Architecture](docs/ARCHITECTURE.md), and [Roadmap](docs/ROADMAP.md).

## Production note

This first branch is a secure foundation. Before production use, configure managed authentication, apply the database migration, configure object storage and a signed worker identity, and complete an independent security review.
