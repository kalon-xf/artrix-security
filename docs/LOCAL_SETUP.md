# Local setup

## Prerequisites

- Node.js 20.11 or newer
- npm 10 or newer
- Docker Desktop or Docker Engine (optional, for PostgreSQL)

## Start the web app

```bash
git clone https://github.com/kalon-xf/artrix-security.git
cd artrix-security
git checkout codex/artrix-build
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

The workspace demo is available only when `NODE_ENV=development` and `ARTRIX_DEMO_MODE=true`. It contains synthetic data only and does not execute network tools or shell commands.

## Verification commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## PostgreSQL

Start the local database with:

```bash
docker compose up -d postgres
```

Apply `supabase/migrations/20260914190000_initial_schema.sql` with your PostgreSQL/Supabase migration tooling. Do not deploy demo mode or default credentials to production.
