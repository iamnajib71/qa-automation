create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'viewer' check (role in ('admin', 'qa_analyst', 'viewer')),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_key text not null unique,
  name text not null,
  description text not null,
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'archived')),
  owner_id uuid not null references public.profiles (id),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  version text not null,
  build_number text not null,
  environment text not null,
  planned_start_date date,
  planned_release_date date,
  status text not null default 'planning' check (status in ('planning', 'in_testing', 'uat', 'ready', 'released', 'delayed')),
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.test_cases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  case_id text not null unique,
  title text not null,
  module text not null,
  preconditions text,
  steps jsonb not null default '[]'::jsonb,
  expected_result text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  type text not null check (type in ('functional', 'regression', 'smoke', 'integration', 'uat', 'api')),
  status text not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  created_by uuid not null references public.profiles (id),
  updated_by uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.test_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  release_id uuid not null references public.releases (id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'blocked')),
  assigned_to uuid references public.profiles (id),
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.test_run_cases (
  id uuid primary key default gen_random_uuid(),
  test_run_id uuid not null references public.test_runs (id) on delete cascade,
  test_case_id uuid not null references public.test_cases (id) on delete cascade,
  result text not null default 'not_run' check (result in ('not_run', 'passed', 'failed', 'blocked')),
  execution_notes text,
  executed_by uuid references public.profiles (id),
  executed_at timestamptz,
  linked_defect_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  constraint test_run_cases_unique_case_per_run unique (test_run_id, test_case_id)
);

create table if not exists public.defects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  release_id uuid references public.releases (id) on delete set null,
  test_run_case_id uuid unique,
  defect_key text not null unique,
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'retest', 'closed')),
  environment text not null,
  assigned_owner_id uuid references public.profiles (id),
  reported_by uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.test_run_cases
  add constraint test_run_cases_linked_defect_fk
  foreign key (linked_defect_id) references public.defects (id) on delete set null;

alter table public.defects
  add constraint defects_test_run_case_fk
  foreign key (test_run_case_id) references public.test_run_cases (id) on delete set null;

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  defect_id uuid references public.defects (id) on delete cascade,
  test_run_id uuid references public.test_runs (id) on delete cascade,
  test_run_case_id uuid references public.test_run_cases (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null default 0,
  uploaded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  constraint attachments_has_parent check (
    defect_id is not null or test_run_id is not null or test_run_case_id is not null
  )
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_projects_status on public.projects (status);
create index if not exists idx_releases_project_id on public.releases (project_id);
create index if not exists idx_releases_status on public.releases (status);
create index if not exists idx_test_cases_project_id on public.test_cases (project_id);
create index if not exists idx_test_runs_release_id on public.test_runs (release_id);
create index if not exists idx_test_run_cases_result on public.test_run_cases (result);
create index if not exists idx_defects_project_id on public.defects (project_id);
create index if not exists idx_defects_status on public.defects (status);
create index if not exists idx_defects_severity on public.defects (severity);
create index if not exists idx_attachments_project_id on public.attachments (project_id);
create index if not exists idx_activity_logs_project_id on public.activity_logs (project_id);
create index if not exists idx_activity_logs_entity on public.activity_logs (entity_type, entity_id);

create or replace function public.get_my_role()
returns text
language sql
stable
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'viewer');
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.releases enable row level security;
alter table public.test_cases enable row level security;
alter table public.test_runs enable row level security;
alter table public.test_run_cases enable row level security;
alter table public.defects enable row level security;
alter table public.attachments enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select using (auth.uid() = id or public.get_my_role() = 'admin');

create policy "profiles_update_own_or_admin" on public.profiles
for update using (auth.uid() = id or public.get_my_role() = 'admin')
with check (auth.uid() = id or public.get_my_role() = 'admin');

create policy "profiles_insert_self_or_admin" on public.profiles
for insert with check (auth.uid() = id or public.get_my_role() = 'admin');

create policy "projects_read_authenticated" on public.projects
for select to authenticated using (true);
create policy "projects_write_editor_roles" on public.projects
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "releases_read_authenticated" on public.releases
for select to authenticated using (true);
create policy "releases_write_editor_roles" on public.releases
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "test_cases_read_authenticated" on public.test_cases
for select to authenticated using (true);
create policy "test_cases_write_editor_roles" on public.test_cases
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "test_runs_read_authenticated" on public.test_runs
for select to authenticated using (true);
create policy "test_runs_write_editor_roles" on public.test_runs
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "test_run_cases_read_authenticated" on public.test_run_cases
for select to authenticated using (true);
create policy "test_run_cases_write_editor_roles" on public.test_run_cases
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "defects_read_authenticated" on public.defects
for select to authenticated using (true);
create policy "defects_write_editor_roles" on public.defects
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "attachments_read_authenticated" on public.attachments
for select to authenticated using (true);
create policy "attachments_write_editor_roles" on public.attachments
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "activity_logs_read_authenticated" on public.activity_logs
for select to authenticated using (true);
create policy "activity_logs_write_editor_roles" on public.activity_logs
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create or replace view public.dashboard_project_summary as
select
  count(*) filter (where p.status = 'active')::int as active_projects,
  count(distinct tc.id)::int as total_test_cases,
  count(distinct d.id) filter (where d.status <> 'closed')::int as open_defects,
  count(trc.id) filter (where trc.result = 'passed')::int as passed_results
from public.projects p
left join public.test_cases tc on tc.project_id = p.id
left join public.defects d on d.project_id = p.id
left join public.test_runs tr on tr.project_id = p.id
left join public.test_run_cases trc on trc.test_run_id = tr.id;

create or replace view public.defect_severity_summary as
select severity, count(*)::int as defect_count
from public.defects
group by severity;

create or replace view public.test_execution_summary_by_release as
select
  r.id as release_id,
  r.name as release_name,
  count(trc.id) filter (where trc.result = 'passed')::int as passed_count,
  count(trc.id) filter (where trc.result = 'failed')::int as failed_count,
  count(trc.id) filter (where trc.result = 'blocked')::int as blocked_count,
  count(trc.id) filter (where trc.result = 'not_run')::int as not_run_count
from public.releases r
left join public.test_runs tr on tr.release_id = r.id
left join public.test_run_cases trc on trc.test_run_id = tr.id
group by r.id, r.name;

create or replace view public.release_readiness_view as
select
  r.id as release_id,
  r.name as release_name,
  r.status as release_status,
  count(distinct d.id) filter (where d.status <> 'closed')::int as defect_count,
  count(trc.id) filter (where trc.result = 'failed')::int as failed_count,
  count(trc.id) filter (where trc.result = 'blocked')::int as blocked_count,
  case
    when count(trc.id) = 0 then 0
    else round((count(trc.id) filter (where trc.result = 'passed')::numeric / count(trc.id)::numeric) * 100, 2)
  end as pass_rate
from public.releases r
left join public.test_runs tr on tr.release_id = r.id
left join public.test_run_cases trc on trc.test_run_id = tr.id
left join public.defects d on d.release_id = r.id
group by r.id, r.name, r.status;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists releases_set_updated_at on public.releases;
create trigger releases_set_updated_at
before update on public.releases
for each row
execute function public.set_updated_at();

drop trigger if exists test_cases_set_updated_at on public.test_cases;
create trigger test_cases_set_updated_at
before update on public.test_cases
for each row
execute function public.set_updated_at();

drop trigger if exists test_runs_set_updated_at on public.test_runs;
create trigger test_runs_set_updated_at
before update on public.test_runs
for each row
execute function public.set_updated_at();

drop trigger if exists defects_set_updated_at on public.defects;
create trigger defects_set_updated_at
before update on public.defects
for each row
execute function public.set_updated_at();

create table if not exists public.project_urls (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label text not null,
  base_url text not null,
  is_primary boolean not null default false,
  scan_preferences jsonb not null default '{"maxPages":1,"maxDepth":0,"sameOriginOnly":true,"timeoutMs":45000}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  project_url_id uuid not null references public.project_urls (id) on delete cascade,
  url text not null,
  normalized_url text not null,
  title text,
  last_http_status integer,
  last_scanned_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint pages_project_url_unique unique (project_id, normalized_url)
);

create table if not exists public.scan_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  project_url_id uuid not null references public.project_urls (id) on delete cascade,
  mode text not null check (mode in ('single_page', 'multi_page', 'site')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  source text not null default 'automated-rule' check (source in ('manual', 'automated-rule', 'automated-ai', 'imported')),
  base_url text not null,
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.page_scans (
  id uuid primary key default gen_random_uuid(),
  scan_run_id uuid not null references public.scan_runs (id) on delete cascade,
  page_id uuid not null references public.pages (id) on delete cascade,
  final_url text not null,
  title text,
  http_status integer,
  response_time_ms integer,
  link_count integer not null default 0,
  form_count integer not null default 0,
  button_count integer not null default 0,
  input_count integer not null default 0,
  image_count integer not null default 0,
  console_error_count integer not null default 0,
  request_failure_count integer not null default 0,
  source text not null default 'automated-rule' check (source in ('manual', 'automated-rule', 'automated-ai', 'imported')),
  confidence_score numeric(5,2) not null default 1.0,
  performance_score integer,
  accessibility_score integer,
  seo_score integer,
  best_practices_score integer,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.findings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  page_id uuid not null references public.pages (id) on delete cascade,
  scan_run_id uuid not null references public.scan_runs (id) on delete cascade,
  page_scan_id uuid not null references public.page_scans (id) on delete cascade,
  category text not null check (category in ('accessibility', 'performance', 'seo', 'best_practice', 'content', 'automation')),
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  confidence_score numeric(5,2) not null default 1.0,
  source text not null default 'automated-rule' check (source in ('manual', 'automated-rule', 'automated-ai', 'imported')),
  recommended_action text not null,
  status text not null default 'automated_finding' check (status in ('suggested_test_case', 'automated_finding', 'draft_defect', 'confirmed_defect')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  page_id uuid not null references public.pages (id) on delete cascade,
  scan_run_id uuid not null references public.scan_runs (id) on delete cascade,
  page_scan_id uuid not null references public.page_scans (id) on delete cascade,
  finding_id uuid references public.findings (id) on delete set null,
  kind text not null check (kind in ('screenshot', 'raw_scan', 'axe_results')),
  label text not null,
  file_path text not null,
  content_type text not null,
  file_size bigint not null default 0,
  source text not null default 'automated-rule' check (source in ('manual', 'automated-rule', 'automated-ai', 'imported')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.report_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  scan_run_id uuid references public.scan_runs (id) on delete cascade,
  snapshot_type text not null default 'scan_summary',
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  scan_run_id uuid references public.scan_runs (id) on delete cascade,
  suggestion_type text not null,
  content jsonb not null default '{}'::jsonb,
  provider text not null default 'rule-based',
  source text not null default 'automated-rule' check (source in ('manual', 'automated-rule', 'automated-ai', 'imported')),
  confidence_score numeric(5,2) not null default 1.0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_urls_project_id on public.project_urls (project_id);
create index if not exists idx_pages_project_id on public.pages (project_id);
create index if not exists idx_scan_runs_project_id on public.scan_runs (project_id);
create index if not exists idx_page_scans_scan_run_id on public.page_scans (scan_run_id);
create index if not exists idx_findings_project_id on public.findings (project_id);
create index if not exists idx_findings_scan_run_id on public.findings (scan_run_id);
create index if not exists idx_evidence_project_id on public.evidence (project_id);
create index if not exists idx_report_snapshots_project_id on public.report_snapshots (project_id);
create index if not exists idx_ai_suggestions_project_id on public.ai_suggestions (project_id);

alter table public.project_urls enable row level security;
alter table public.pages enable row level security;
alter table public.scan_runs enable row level security;
alter table public.page_scans enable row level security;
alter table public.findings enable row level security;
alter table public.evidence enable row level security;
alter table public.report_snapshots enable row level security;
alter table public.ai_suggestions enable row level security;

create policy "project_urls_read_authenticated" on public.project_urls
for select to authenticated using (true);
create policy "project_urls_write_editor_roles" on public.project_urls
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "pages_read_authenticated" on public.pages
for select to authenticated using (true);
create policy "pages_write_editor_roles" on public.pages
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "scan_runs_read_authenticated" on public.scan_runs
for select to authenticated using (true);
create policy "scan_runs_write_editor_roles" on public.scan_runs
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "page_scans_read_authenticated" on public.page_scans
for select to authenticated using (true);
create policy "page_scans_write_editor_roles" on public.page_scans
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "findings_read_authenticated" on public.findings
for select to authenticated using (true);
create policy "findings_write_editor_roles" on public.findings
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "evidence_read_authenticated" on public.evidence
for select to authenticated using (true);
create policy "evidence_write_editor_roles" on public.evidence
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "report_snapshots_read_authenticated" on public.report_snapshots
for select to authenticated using (true);
create policy "report_snapshots_write_editor_roles" on public.report_snapshots
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create policy "ai_suggestions_read_authenticated" on public.ai_suggestions
for select to authenticated using (true);
create policy "ai_suggestions_write_editor_roles" on public.ai_suggestions
for all to authenticated using (public.get_my_role() in ('admin', 'qa_analyst'))
with check (public.get_my_role() in ('admin', 'qa_analyst'));

create or replace view public.website_scan_dashboard as
select
  p.id as project_id,
  p.name as project_name,
  count(distinct pg.id)::int as pages_scanned,
  count(distinct sr.id)::int as scan_runs,
  count(distinct f.id)::int as total_findings,
  count(distinct f.id) filter (where f.severity in ('high', 'critical'))::int as high_risk_findings,
  coalesce(avg((ps.accessibility_score)::numeric), 0)::numeric(5,2) as avg_accessibility_score,
  coalesce(avg((ps.performance_score)::numeric), 0)::numeric(5,2) as avg_performance_score,
  coalesce(avg((ps.seo_score)::numeric), 0)::numeric(5,2) as avg_seo_score
from public.projects p
left join public.pages pg on pg.project_id = p.id
left join public.scan_runs sr on sr.project_id = p.id
left join public.page_scans ps on ps.scan_run_id = sr.id
left join public.findings f on f.scan_run_id = sr.id
group by p.id, p.name;

create trigger project_urls_set_updated_at
before update on public.project_urls
for each row
execute function public.set_updated_at();

create trigger pages_set_updated_at
before update on public.pages
for each row
execute function public.set_updated_at();

create trigger scan_runs_set_updated_at
before update on public.scan_runs
for each row
execute function public.set_updated_at();

create trigger findings_set_updated_at
before update on public.findings
for each row
execute function public.set_updated_at();

