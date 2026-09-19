-- AIFIX3R Superhuman: evidence-grounded mission graph and pgvector-ready memory.
-- This migration stores plans and decisions. It does not grant a worker execution authority.

create extension if not exists vector with schema extensions;

create table public.agent_missions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  scope_id uuid not null references public.scopes(id) on delete restrict,
  asset_id uuid not null references public.assets(id) on delete restrict,
  name text not null default 'AIFIX3R Superhuman',
  objective text not null check (char_length(objective) between 12 and 500),
  status text not null check (status in ('blocked', 'awaiting_human_approval', 'ready_for_validation', 'completed', 'cancelled')),
  planner_version text not null,
  authorization_snapshot jsonb not null,
  guardrails jsonb not null default '[]'::jsonb,
  stop_conditions jsonb not null default '[]'::jsonb,
  next_action text not null,
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mission_id uuid not null references public.agent_missions(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  phase text not null,
  title text not null,
  kind text not null check (kind in ('authorization_gate', 'planning', 'safe_job', 'evidence', 'memory', 'analysis', 'human_checkpoint', 'reporting')),
  status text not null check (status in ('blocked', 'pending', 'running', 'completed', 'awaiting_approval')),
  depends_on jsonb not null default '[]'::jsonb,
  approval_required boolean not null default false,
  approved_job_type text,
  evidence_ids jsonb not null default '[]'::jsonb,
  rationale text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mission_id, sequence)
);

create table public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mission_id uuid not null references public.agent_missions(id) on delete cascade,
  kind text not null check (kind in ('evidence', 'pattern', 'decision')),
  content text not null,
  source_type text not null check (source_type in ('evidence', 'pattern_card', 'approval', 'finding', 'retest')),
  source_id text not null,
  grounding text not null check (grounding in ('verified_observation', 'candidate_pattern', 'human_decision')),
  similarity numeric(5,4) check (similarity between 0 and 1),
  embedding extensions.vector(1536),
  embedding_model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.agent_hypotheses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mission_id uuid not null references public.agent_missions(id) on delete cascade,
  title text not null,
  summary text not null,
  status text not null default 'candidate' check (status in ('candidate', 'rejected', 'human_validated')),
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  evidence_ids jsonb not null default '[]'::jsonb,
  missing_evidence jsonb not null default '[]'::jsonb,
  requires_human_validation boolean not null default true check (requires_human_validation),
  validated_by uuid references auth.users(id),
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mission_id uuid not null references public.agent_missions(id) on delete cascade,
  task_id uuid references public.agent_tasks(id) on delete set null,
  decision text not null check (decision in ('approved', 'rejected')),
  rationale text not null,
  decided_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index agent_missions_org_status_idx on public.agent_missions (organization_id, status, created_at desc);
create index agent_tasks_mission_sequence_idx on public.agent_tasks (mission_id, sequence);
create index agent_memories_mission_kind_idx on public.agent_memories (mission_id, kind, created_at desc);
create index agent_hypotheses_mission_status_idx on public.agent_hypotheses (mission_id, status, confidence desc);
create index agent_approvals_mission_created_idx on public.agent_approvals (mission_id, created_at desc);
create index agent_memories_embedding_hnsw_idx on public.agent_memories using hnsw (embedding vector_cosine_ops) where embedding is not null;

create trigger agent_missions_set_updated_at before update on public.agent_missions for each row execute procedure public.set_updated_at();
create trigger agent_tasks_set_updated_at before update on public.agent_tasks for each row execute procedure public.set_updated_at();
create trigger agent_hypotheses_set_updated_at before update on public.agent_hypotheses for each row execute procedure public.set_updated_at();

alter table public.agent_missions enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.agent_memories enable row level security;
alter table public.agent_hypotheses enable row level security;
alter table public.agent_approvals enable row level security;

create policy "agent_missions_tenant_read" on public.agent_missions for select using (public.is_org_member(organization_id));
create policy "agent_missions_tenant_create" on public.agent_missions for insert with check (public.is_org_member(organization_id));
create policy "agent_missions_lead_update" on public.agent_missions for update using (public.is_org_lead(organization_id)) with check (public.is_org_lead(organization_id));
create policy "agent_tasks_tenant_read" on public.agent_tasks for select using (public.is_org_member(organization_id));
create policy "agent_tasks_tenant_create" on public.agent_tasks for insert with check (public.is_org_member(organization_id));
create policy "agent_tasks_lead_update" on public.agent_tasks for update using (public.is_org_lead(organization_id)) with check (public.is_org_lead(organization_id));
create policy "agent_memories_tenant_read" on public.agent_memories for select using (public.is_org_member(organization_id));
create policy "agent_memories_tenant_create" on public.agent_memories for insert with check (public.is_org_member(organization_id));
create policy "agent_hypotheses_tenant_read" on public.agent_hypotheses for select using (public.is_org_member(organization_id));
create policy "agent_hypotheses_tenant_create" on public.agent_hypotheses for insert with check (public.is_org_member(organization_id));
create policy "agent_hypotheses_lead_update" on public.agent_hypotheses for update using (public.is_org_lead(organization_id)) with check (public.is_org_lead(organization_id));
create policy "agent_approvals_tenant_read" on public.agent_approvals for select using (public.is_org_member(organization_id));
create policy "agent_approvals_lead_create" on public.agent_approvals for insert with check (public.is_org_lead(organization_id));

comment on table public.agent_missions is 'Authorized AIFIX3R Superhuman missions with immutable authorization snapshots.';
comment on table public.agent_memories is 'Evidence- and decision-linked memory. Similarity is retrieval relevance, not proof.';
comment on table public.agent_hypotheses is 'Falsifiable candidates that cannot become human_validated without a reviewer decision.';
