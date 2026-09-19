# Deployment guide

## Before production

1. Configure a managed PostgreSQL/Supabase project and apply the reviewed migration.
2. Configure a production authentication provider; do not deploy local demo mode.
3. Set `NEXT_PUBLIC_APP_URL` to the public HTTPS origin.
4. Configure protected object storage for evidence and a data-retention job.
5. Deploy a signed local/remote worker with egress restrictions and no shell-command API.
6. Put API routes behind a durable shared rate limiter.
7. Enable central logs, error monitoring, backup/restore testing, and independent security review.

## Container deployment

```bash
docker compose build app
docker compose up -d
```

For a real deployment, replace the Docker Compose PostgreSQL password with a managed secret and use a managed database. Apply `supabase/migrations/20260914190000_initial_schema.sql` before accepting customer data.

## Required production environment variables

```bash
NODE_ENV=production
ARTRIX_DEMO_MODE=false
NEXT_PUBLIC_APP_URL=https://your-artrix-domain.example
DATABASE_URL=postgresql://...
AUTH_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Never place private keys, worker signing material, database passwords, or third-party API keys in the repository or browser environment.
