-- Artrix initial multi-tenant schema
-- Apply with Supabase CLI or a reviewed PostgreSQL migration process.
-- No demo users, passwords, or production secrets are created here.

create extension if not exists pgcrypto;

create type public.app_role as enum (
  'platform_admin',
  'organization_owner',
  'security_lead',
  'researcher',
  'client_viewer',
  'remediation_member'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  primary_contact_name text,
  primary_contact_email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  name text not null check (char_length(name) between 3 and 200),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'closed')),
  starts_on date,
  ends_on date,
  methodology text,
  data_retention_days integer check (data_retention_days between 1 and 3650),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table public.authorizations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired', 'revoked')),
  written_authorization_reference text,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  emergency_contact text,
  stop_conditions jsonb not null default '[]'::jsonb,
  approval_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scopes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  authorization_id uuid not null references public.authorizations(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'approved', 'expired', 'rejected', 'revoked')),
  approved_domains jsonb not null default '[]'::jsonb,
  approved_apis jsonb not null default '[]'::jsonb,
  approved_ip_ranges jsonb not null default '[]'::jsonb,
  approved_apps jsonb not null default '[]'::jsonb,
  approved_environments jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  allowed_test_types jsonb not null default '[]'::jsonb,
  rate_limit_per_minute integer not null default 20 check (rate_limit_per_minute between 1 and 600),
  timeout_seconds integer not null default 120 check (timeout_seconds between 5 and 3600),
  testing_window jsonb not null default '{}'::jsonb,
  data_retention_days integer check (data_retention_days between 1 and 3650),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scope_id uuid not null references public.scopes(id) on delete cascade,
  kind text not null check (kind in ('root_domain', 'subdomain', 'url', 'api', 'ip_range', 'application')),
  value text not null,
  normalized_value text not null,
  environment text not null default 'unknown' check (environment in ('development', 'staging', 'production', 'unknown')),
  owner_label text,
  scope_status text not null default 'in_scope' check (scope_status in ('in_scope', 'out_of_scope', 'pending_review')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  technologies jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope_id, kind, normalized_value)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  scope_id uuid not null references public.scopes(id) on delete restrict,
  asset_id uuid references public.assets(id) on delete set null,
  job_type text not null check (job_type in (
    'passive_subdomain_discovery',
    'dns_resolution',
    'permitted_http_probing',
    'technology_fingerprinting',
    'approved_url_collection',
    'controlled_template_check'
  )),
  manifest jsonb not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  requested_by uuid not null references auth.users(id),
  cancellation_requested_at timestamptz,
  retention_until timestamptz,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table public.job_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_id text not null,
  tool_name text not null,
  tool_version text not null,
  status text not null check (status in ('running', 'completed', 'failed', 'cancelled')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  exit_summary text,
  artifact_storage_path text,
  artifact_sha256 text
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  finding_id uuid,
  kind text not null check (kind in ('job_output', 'screenshot', 'request_response', 'note', 'retest', 'ai_test')),
  title text not null,
  sanitized_summary text not null,
  storage_path text,
  sha256 text,
  encryption_key_version text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  scope_id uuid references public.scopes(id) on delete set null,
  title text not null check (char_length(title) between 3 and 240),
  status text not null default 'draft' check (status in ('draft', 'needs_validation', 'validated', 'reported', 'accepted', 'fixed', 'retest_passed', 'closed')),
  severity text not null check (severity in ('critical', 'high', 'medium', 'low', 'informational')),
  cvss_vector text,
  cvss_score numeric(3,1) check (cvss_score is null or (cvss_score >= 0 and cvss_score <= 10)),
  business_impact text not null default '',
  remediation text not null default '',
  reproduction_steps text not null default '',
  references jsonb not null default '[]'::jsonb,
  duplicate_of uuid references public.findings(id) on delete set null,
  validated_by uuid references auth.users(id),
  validated_at timestamptz,
  reported_at timestamptz,
  closed_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.evidence
  add constraint evidence_finding_id_fkey
  foreign key (finding_id) references public.findings(id) on delete set null;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  type text not null check (type in ('executive_summary', 'technical', 'hackerone', 'bugcrowd', 'ai_red_team', 'api_authorization', 'retest', 'rules_of_engagement')),
  title text not null,
  markdown text not null,
  html text not null,
  generated_by uuid not null references auth.users(id),
  generated_at timestamptz not null default now()
);

create table public.remediation_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  finding_id uuid not null references public.findings(id) on delete cascade,
  owner_user_id uuid references auth.users(id),
  owner_label text,
  title text not null,
  due_date date,
  priority text not null check (priority in ('high', 'medium', 'low')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'ready_for_retest', 'done', 'blocked')),
  comments jsonb not null default '[]'::jsonb,
  evidence_of_fix jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.retests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  finding_id uuid not null references public.findings(id) on delete cascade,
  requested_by uuid references auth.users(id),
  performed_by uuid references auth.users(id),
  result text not null check (result in ('pass', 'partial_pass', 'fail', 'not_tested')),
  notes text not null,
  explicit_closure_decision boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  actor_role public.app_role,
  action text not null,
  subject_type text not null,
  subject_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_systems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  name text not null,
  model_name text,
  description text,
  rag_sources jsonb not null default '[]'::jsonb,
  agents jsonb not null default '[]'::jsonb,
  tools jsonb not null default '[]'::jsonb,
  permissions jsonb not null default '[]'::jsonb,
  data_classes jsonb not null default '[]'::jsonb,
  approval_points jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_test_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  category text not null check (category in ('prompt_injection', 'indirect_prompt_injection', 'rag_source_trust', 'tool_permissions', 'sensitive_data', 'human_approval')),
  description text not null,
  benign_test_instructions text not null,
  created_at timestamptz not null default now()
);

create table public.ai_test_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ai_system_id uuid not null references public.ai_systems(id) on delete cascade,
  test_case_id uuid references public.ai_test_cases(id) on delete set null,
  result text not null check (result in ('pass', 'partial_pass', 'fail')),
  evidence_summary text not null,
  mitigation text not null,
  retest_status text not null default 'not_requested' check (retest_status in ('not_requested', 'requested', 'passed', 'failed')),
  performed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index memberships_user_org_idx on public.memberships (user_id, organization_id);
create index clients_org_idx on public.clients (organization_id);
create index engagements_org_client_idx on public.engagements (organization_id, client_id);
create index scopes_engagement_status_idx on public.scopes (engagement_id, status);
create index assets_scope_normalized_idx on public.assets (scope_id, normalized_value);
create index jobs_scope_status_idx on public.jobs (scope_id, status);
create index findings_engagement_status_idx on public.findings (engagement_id, status);
create index remediation_finding_status_idx on public.remediation_tasks (finding_id, status);
create index audit_org_created_idx on public.audit_logs (organization_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_org_id and user_id = auth.uid() and accepted_at is not null
  );
$$;

create or replace function public.is_org_lead(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_org_id
      and user_id = auth.uid()
      and accepted_at is not null
      and role in ('organization_owner', 'security_lead')
  );
$$;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_lead(uuid) to authenticated;

create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger organizations_set_updated_at before update on public.organizations for each row execute procedure public.set_updated_at();
create trigger clients_set_updated_at before update on public.clients for each row execute procedure public.set_updated_at();
create trigger engagements_set_updated_at before update on public.engagements for each row execute procedure public.set_updated_at();
create trigger authorizations_set_updated_at before update on public.authorizations for each row execute procedure public.set_updated_at();
create trigger scopes_set_updated_at before update on public.scopes for each row execute procedure public.set_updated_at();
create trigger assets_set_updated_at before update on public.assets for each row execute procedure public.set_updated_at();
create trigger findings_set_updated_at before update on public.findings for each row execute procedure public.set_updated_at();
create trigger remediation_tasks_set_updated_at before update on public.remediation_tasks for each row execute procedure public.set_updated_at();
create trigger ai_systems_set_updated_at before update on public.ai_systems for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.clients enable row level security;
alter table public.engagements enable row level security;
alter table public.authorizations enable row level security;
alter table public.scopes enable row level security;
alter table public.assets enable row level security;
alter table public.jobs enable row level security;
alter table public.job_runs enable row level security;
alter table public.evidence enable row level security;
alter table public.findings enable row level security;
alter table public.reports enable row level security;
alter table public.remediation_tasks enable row level security;
alter table public.retests enable row level security;
alter table public.audit_logs enable row level security;
alter table public.ai_systems enable row level security;
alter table public.ai_test_cases enable row level security;
alter table public.ai_test_runs enable row level security;

create policy "profiles_own_record" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "organizations_members_read" on public.organizations for select using (public.is_org_member(id));
create policy "organizations_owner_create" on public.organizations for insert with check (owner_id = auth.uid());
create policy "organizations_lead_update" on public.organizations for update using (public.is_org_lead(id)) with check (public.is_org_lead(id));

create policy "memberships_members_read" on public.memberships for select using (public.is_org_member(organization_id));
create policy "memberships_leads_manage" on public.memberships for all using (public.is_org_lead(organization_id)) with check (public.is_org_lead(organization_id));

create policy "clients_tenant" on public.clients for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "engagements_tenant" on public.engagements for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "authorizations_tenant" on public.authorizations for all using (public.is_org_member(organization_id)) with check (public.is_org_lead(organization_id));
create policy "scopes_tenant" on public.scopes for all using (public.is_org_member(organization_id)) with check (public.is_org_lead(organization_id));
create policy "assets_tenant" on public.assets for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "jobs_tenant" on public.jobs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "job_runs_tenant" on public.job_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "evidence_tenant" on public.evidence for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "findings_tenant" on public.findings for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "reports_tenant" on public.reports for all using (public.is_org_member(organization_id)) with check (public.is_org_lead(organization_id));
create policy "remediation_tasks_tenant" on public.remediation_tasks for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "retests_tenant" on public.retests for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "audit_logs_tenant_read" on public.audit_logs for select using (public.is_org_member(organization_id));
create policy "ai_systems_tenant" on public.ai_systems for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "ai_test_cases_tenant" on public.ai_test_cases for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "ai_test_runs_tenant" on public.ai_test_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
