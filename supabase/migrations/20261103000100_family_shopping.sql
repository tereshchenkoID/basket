begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  avatar_url text check (char_length(avatar_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80 and name = btrim(regexp_replace(name, '\s+', ' ', 'g'))),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  -- Retain the recipient's own row so RLS can deliver an UPDATE revoking access.
  removed_at timestamptz,
  primary key (group_id, user_id),
  check (role <> 'owner' or removed_at is null)
);
create unique index group_members_one_owner on public.group_members(group_id) where role = 'owner';
create index group_members_user_active on public.group_members(user_id, group_id) where removed_at is null;

create table public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null default now() + interval '7 days',
  max_uses integer not null default 1 check (max_uses = 1),
  use_count integer not null default 0 check (use_count between 0 and max_uses),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index group_invites_group on public.group_invites(group_id);
create index group_invites_creator on public.group_invites(created_by);

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100 and title = btrim(regexp_replace(title, '\s+', ' ', 'g'))),
  created_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index shopping_lists_group on public.shopping_lists(group_id, status);
create index shopping_lists_creator on public.shopping_lists(created_by);

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120 and name = btrim(regexp_replace(name, '\s+', ' ', 'g'))),
  quantity numeric not null default 1 check (quantity > 0 and quantity <= 1000000 and quantity <> 'NaN'::numeric),
  unit text not null default 'pcs' check (unit in ('pcs', 'kg', 'g', 'l', 'ml', 'pack')),
  is_purchased boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  purchased_by uuid references auth.users(id) on delete restrict,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Soft delete: scoped UPDATEs are RLS-authorized, unlike Realtime DELETE events.
  deleted_at timestamptz,
  check ((is_purchased and purchased_by is not null and purchased_at is not null)
    or (not is_purchased and purchased_by is null and purchased_at is null))
);
create index shopping_items_list on public.shopping_items(list_id, is_purchased) where deleted_at is null;
create index shopping_items_creator on public.shopping_items(created_by);
create index shopping_items_purchaser on public.shopping_items(purchased_by);
create index groups_creator on public.groups(created_by);

create function private.is_member(p_group_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.group_members m
    where m.group_id = p_group_id and m.user_id = auth.uid() and m.removed_at is null
  );
$$;
create function private.is_owner(p_group_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.group_members m
    where m.group_id = p_group_id and m.user_id = auth.uid() and m.role = 'owner' and m.removed_at is null
  );
$$;
revoke all on function private.is_member(uuid), private.is_owner(uuid) from public, anon;
grant execute on function private.is_member(uuid), private.is_owner(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;

-- Tables are read-only over REST. Mutations have one path: checked atomic RPCs below.
revoke all on public.profiles, public.groups, public.group_members, public.group_invites,
  public.shopping_lists, public.shopping_items from anon, authenticated;
grant select on public.profiles, public.groups, public.group_members, public.group_invites,
  public.shopping_lists, public.shopping_items to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

create policy profiles_own_read on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_own_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy groups_member_read on public.groups for select to authenticated using (private.is_member(id));
create policy members_read on public.group_members for select to authenticated
  using (user_id = (select auth.uid()) or private.is_member(group_id));
create policy invites_owner_read on public.group_invites for select to authenticated using (private.is_owner(group_id));
create policy lists_member_read on public.shopping_lists for select to authenticated using (private.is_member(group_id));
create policy items_member_read on public.shopping_items for select to authenticated using (
  exists (select 1 from public.shopping_lists l where l.id = list_id and private.is_member(l.group_id))
);

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := clock_timestamp(); return new; end;
$$;
create trigger profiles_updated before update on public.profiles for each row execute function private.touch_updated_at();
create trigger groups_updated before update on public.groups for each row execute function private.touch_updated_at();
create trigger lists_updated before update on public.shopping_lists for each row execute function private.touch_updated_at();
create trigger items_updated before update on public.shopping_items for each row execute function private.touch_updated_at();

create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name, avatar_url)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 120),
    left(new.raw_user_meta_data->>'avatar_url', 2048)) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user(), private.touch_updated_at() from public, anon, authenticated;
create trigger basket_profile_created after insert on auth.users for each row execute function private.handle_new_user();
insert into public.profiles(id, display_name, avatar_url)
select id, left(coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'), 120),
  left(raw_user_meta_data->>'avatar_url', 2048) from auth.users on conflict (id) do nothing;

create function public.create_group(p_id uuid, p_name text, p_list_title text) returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
  -- Retries with the same operation id never create another group or initial list.
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  if exists (select 1 from public.groups where id = p_id) then
    if not private.is_owner(p_id) then raise exception 'forbidden' using errcode = '42501'; end if;
    return p_id;
  end if;
  insert into public.groups(id, name, created_by)
    values(p_id, btrim(regexp_replace(p_name, '\s+', ' ', 'g')), auth.uid());
  insert into public.group_members(group_id, user_id, role) values (p_id, auth.uid(), 'owner');
  insert into public.shopping_lists(group_id, title, created_by)
    values(p_id, btrim(regexp_replace(p_list_title, '\s+', ' ', 'g')), auth.uid());
  return p_id;
end;
$$;

create function public.rename_group(p_group_id uuid, p_name text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_owner(p_group_id) then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.groups set name = btrim(regexp_replace(p_name, '\s+', ' ', 'g')) where id = p_group_id;
end;
$$;

create function public.remove_group_member(p_group_id uuid, p_member_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.is_member(p_group_id) then raise exception 'forbidden' using errcode = '42501'; end if;
  if private.is_owner(p_group_id) and p_member_id = auth.uid() then raise exception 'owner_cannot_leave'; end if;
  if not private.is_owner(p_group_id) and p_member_id <> auth.uid() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.group_members set removed_at = clock_timestamp()
    where group_id = p_group_id and user_id = p_member_id and role = 'member' and removed_at is null;
end;
$$;

create function public.group_member_profiles(p_group_id uuid)
returns table (user_id uuid, display_name text, avatar_url text, role text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_member(p_group_id) then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select p.id, p.display_name, p.avatar_url, m.role
    from public.group_members m join public.profiles p on p.id = m.user_id
    where m.group_id = p_group_id and m.removed_at is null order by m.joined_at;
end;
$$;

create function public.create_group_invite(p_group_id uuid, p_token_hash text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not private.is_owner(p_group_id) then raise exception 'forbidden' using errcode = '42501'; end if;
  insert into public.group_invites(group_id, token_hash, created_by) values (p_group_id, p_token_hash, auth.uid()) returning id into v_id;
  return v_id;
end;
$$;
create function public.revoke_group_invite(p_invite_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.group_invites i where i.id = p_invite_id and private.is_owner(i.group_id)) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.group_invites set revoked_at = clock_timestamp() where id = p_invite_id;
end;
$$;

create function public.preview_group_invite(p_token text)
returns table (group_id uuid, group_name text, already_member boolean)
language plpgsql stable security definer set search_path = '' as $$
declare v_invite public.group_invites;
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
  if p_token !~ '^[A-Za-z0-9_-]{43}$' then raise exception 'invalid_invite'; end if;
  select * into v_invite from public.group_invites where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
  if not found then raise exception 'invalid_invite'; end if;
  -- Current members may revisit a consumed invitation without consuming another use.
  if not private.is_member(v_invite.group_id) and
    (v_invite.revoked_at is not null or v_invite.expires_at <= now() or v_invite.use_count >= v_invite.max_uses) then
    raise exception 'invalid_invite';
  end if;
  return query select g.id, g.name, private.is_member(g.id) from public.groups g where g.id = v_invite.group_id;
end;
$$;

create function public.accept_group_invite(p_token text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_invite public.group_invites;
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
  if p_token !~ '^[A-Za-z0-9_-]{43}$' then raise exception 'invalid_invite'; end if;
  select * into v_invite from public.group_invites
    where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex') for update;
  if not found then raise exception 'invalid_invite'; end if;
  if private.is_member(v_invite.group_id) then return v_invite.group_id; end if;
  if v_invite.revoked_at is not null or v_invite.expires_at <= now() or v_invite.use_count >= v_invite.max_uses then
    raise exception 'invalid_invite';
  end if;
  insert into public.group_members(group_id, user_id, role) values (v_invite.group_id, auth.uid(), 'member')
    on conflict (group_id, user_id) do update set removed_at = null, joined_at = now()
    where public.group_members.role = 'member';
  update public.group_invites set use_count = use_count + 1 where id = v_invite.id;
  return v_invite.group_id;
end;
$$;

create function public.create_shopping_list(p_id uuid, p_group_id uuid, p_title text) returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_member(p_group_id) then raise exception 'forbidden' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 1));
  if exists(select 1 from public.shopping_lists where id = p_id) then
    if not exists(select 1 from public.shopping_lists where id = p_id and group_id = p_group_id and created_by = auth.uid()) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    return p_id;
  end if;
  insert into public.shopping_lists(id, group_id, title, created_by)
    values (p_id, p_group_id, btrim(regexp_replace(p_title, '\s+', ' ', 'g')), auth.uid());
  return p_id;
end;
$$;

create function public.update_shopping_list(p_list_id uuid, p_title text default null, p_status text default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.shopping_lists l where l.id = p_list_id and private.is_member(l.group_id)) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.shopping_lists set
    title = case when p_title is null then title else btrim(regexp_replace(p_title, '\s+', ' ', 'g')) end,
    status = coalesce(p_status, status) where id = p_list_id;
end;
$$;

create function private.assert_writable_list(p_list_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- Lock the list until commit: archive/member removal and writes cannot straddle authorization.
  perform 1 from public.shopping_lists l join public.group_members m on m.group_id = l.group_id
    where l.id = p_list_id and l.status = 'active' and m.user_id = auth.uid() and m.removed_at is null
    for share of l, m;
  if not found or auth.uid() is null then raise exception 'forbidden' using errcode = '42501'; end if;
end;
$$;
revoke all on function private.assert_writable_list(uuid) from public, anon, authenticated;

create function public.add_shopping_item(p_id uuid, p_list_id uuid, p_name text, p_quantity numeric, p_unit text) returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_writable_list(p_list_id);
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 2));
  if exists(select 1 from public.shopping_items where id = p_id) then
    if not exists(select 1 from public.shopping_items where id = p_id and list_id = p_list_id and created_by = auth.uid()) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    return p_id;
  end if;
  insert into public.shopping_items(id, list_id, name, quantity, unit, created_by)
    values(p_id, p_list_id, btrim(regexp_replace(p_name, '\s+', ' ', 'g')), p_quantity, p_unit, auth.uid());
  return p_id;
end;
$$;

create function public.edit_shopping_item(p_item_id uuid, p_name text, p_quantity numeric, p_unit text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_list uuid;
begin
  select list_id into v_list from public.shopping_items where id = p_item_id and deleted_at is null;
  perform private.assert_writable_list(v_list);
  update public.shopping_items set name = btrim(regexp_replace(p_name, '\s+', ' ', 'g')), quantity = p_quantity, unit = p_unit
    where id = p_item_id and deleted_at is null;
end;
$$;

-- Set desired state, never invert cached client state. Retries are idempotent.
create function public.set_item_purchased(p_item_id uuid, p_purchased boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v_list uuid;
begin
  if p_purchased is null then raise exception 'invalid_input'; end if;
  select list_id into v_list from public.shopping_items where id = p_item_id and deleted_at is null;
  perform private.assert_writable_list(v_list);
  update public.shopping_items set is_purchased = p_purchased,
    purchased_by = case when p_purchased then auth.uid() else null end,
    purchased_at = case when p_purchased then clock_timestamp() else null end
    where id = p_item_id and deleted_at is null and is_purchased is distinct from p_purchased;
end;
$$;

create function public.delete_shopping_item(p_item_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_list uuid;
begin
  select list_id into v_list from public.shopping_items where id = p_item_id;
  perform private.assert_writable_list(v_list);
  update public.shopping_items set deleted_at = clock_timestamp() where id = p_item_id and deleted_at is null;
end;
$$;

create function public.dashboard_groups()
returns table (id uuid, name text, member_count bigint, remaining_count bigint)
language sql stable security invoker set search_path = '' as $$
  select g.id, g.name,
    (select count(*) from public.group_members m where m.group_id = g.id and m.removed_at is null),
    (select count(*) from public.shopping_items i join public.shopping_lists l on l.id = i.list_id
      where l.group_id = g.id and l.status = 'active' and i.deleted_at is null and not i.is_purchased)
  from public.groups g order by g.created_at;
$$;

-- New functions default to PUBLIC EXECUTE: explicitly close it for every entry point.
revoke all on function public.create_group(uuid,text,text), public.rename_group(uuid,text),
  public.remove_group_member(uuid,uuid), public.group_member_profiles(uuid),
  public.create_group_invite(uuid,text), public.revoke_group_invite(uuid),
  public.preview_group_invite(text), public.accept_group_invite(text),
  public.create_shopping_list(uuid,uuid,text), public.update_shopping_list(uuid,text,text),
  public.add_shopping_item(uuid,uuid,text,numeric,text), public.edit_shopping_item(uuid,text,numeric,text),
  public.set_item_purchased(uuid,boolean), public.delete_shopping_item(uuid), public.dashboard_groups()
from public, anon;
grant execute on function public.create_group(uuid,text,text), public.rename_group(uuid,text),
  public.remove_group_member(uuid,uuid), public.group_member_profiles(uuid),
  public.create_group_invite(uuid,text), public.revoke_group_invite(uuid),
  public.preview_group_invite(text), public.accept_group_invite(text),
  public.create_shopping_list(uuid,uuid,text), public.update_shopping_list(uuid,text,text),
  public.add_shopping_item(uuid,uuid,text,numeric,text), public.edit_shopping_item(uuid,text,numeric,text),
  public.set_item_purchased(uuid,boolean), public.delete_shopping_item(uuid), public.dashboard_groups()
to authenticated;

-- Supabase owns this publication. Embedded PostgreSQL security tests omit it.
do $$
begin
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.group_members, public.shopping_lists, public.shopping_items, public.groups;
  end if;
end;
$$;
commit;
