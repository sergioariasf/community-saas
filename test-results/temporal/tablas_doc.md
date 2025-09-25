create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();

create table public.agents (
id uuid not null default gen_random_uuid (),
organization_id uuid null,
name text not null,
purpose text not null,
prompt_template text not null,
variables jsonb not null default '{}'::jsonb,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint agents_pkey primary key (id),
constraint unique_organization_agent_name unique (organization_id, name),
constraint agents_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
constraint agents_name_check check (
(
(
length(
TRIM(
both
from
name
)
) >= 2
)
and (
length(
TRIM(
both
from
name
)
) <= 100
)
)
),
constraint agents_prompt_template_check check (
(
length(
TRIM(
both
from
prompt_template
)
) >= 20
)
),
constraint agents_purpose_check check (
(
(
length(
TRIM(
both
from
purpose
)
) >= 10
)
and (
length(
TRIM(
both
from
purpose
)
) <= 500
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_agents_organization_id on public.agents using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_agents_name on public.agents using btree (name) TABLESPACE pg_default;

create index IF not exists idx_agents_is_active on public.agents using btree (is_active) TABLESPACE pg_default;

create trigger agents_updated_at_trigger BEFORE
update on agents for EACH row
execute FUNCTION update_updated_at_column ();
