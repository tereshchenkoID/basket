begin;

alter table public.groups add column deleted_at timestamptz;
create index groups_deleted_cleanup on public.groups(deleted_at) where deleted_at is not null;
-- A recipient may always read their own membership, even after access is revoked.
alter table public.group_members add column revision bigint not null default 0;

create or replace function private.is_member(p_group_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.group_members m join public.groups g on g.id = m.group_id
    where m.group_id = p_group_id and m.user_id = auth.uid()
      and m.removed_at is null and g.deleted_at is null
  );
$$;
create or replace function private.is_owner(p_group_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_member(p_group_id) and exists (
    select 1 from public.group_members m where m.group_id = p_group_id
      and m.user_id = auth.uid() and m.role = 'owner' and m.removed_at is null
  );
$$;

create function private.group_lifecycle_changed() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.group_members set revision = revision + 1
    where group_id = new.id and removed_at is null;
  return new;
end;
$$;
revoke all on function private.group_lifecycle_changed() from public, anon, authenticated;
create trigger groups_lifecycle after update of deleted_at on public.groups
  for each row when (old.deleted_at is distinct from new.deleted_at)
  execute function private.group_lifecycle_changed();

-- Defense in depth for every existing and future RPC that writes group children.
-- Lock the parent until commit, so writes cannot cross a committed deletion.
create function private.require_active_group() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_group uuid;
begin
  if tg_table_name = 'group_members' and tg_op = 'UPDATE' then
    if (to_jsonb(new) - 'revision') = (to_jsonb(old) - 'revision') then return new; end if;
  end if;
  if tg_table_name = 'shopping_items' then
    select group_id into v_group from public.shopping_lists where id = new.list_id;
  else
    v_group := new.group_id;
  end if;
  perform 1 from public.groups where id = v_group and deleted_at is null for share;
  if not found then raise exception 'group_unavailable' using errcode = '42501'; end if;
  return new;
end;
$$;
revoke all on function private.require_active_group() from public, anon, authenticated;
create trigger members_active before insert or update on public.group_members
  for each row execute function private.require_active_group();
create trigger invites_active before insert or update on public.group_invites
  for each row execute function private.require_active_group();
create trigger lists_active before insert or update on public.shopping_lists
  for each row execute function private.require_active_group();
create trigger items_active before insert or update on public.shopping_items
  for each row execute function private.require_active_group();

create function public.delete_group(p_group_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_group public.groups;
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
  select * into v_group from public.groups where id = p_group_id for update;
  if not found then raise exception 'group_unavailable'; end if;
  if v_group.created_by <> auth.uid() or not exists (
    select 1 from public.group_members where group_id = p_group_id
      and user_id = auth.uid() and role = 'owner' and removed_at is null
  ) then raise exception 'forbidden' using errcode = '42501'; end if;
  if v_group.deleted_at is not null then return; end if;
  update public.group_invites set revoked_at = coalesce(revoked_at, clock_timestamp()) where group_id = p_group_id;
  update public.groups set deleted_at = clock_timestamp() where id = p_group_id;
end;
$$;

create function public.restore_group(p_group_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_group public.groups;
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
  select * into v_group from public.groups where id = p_group_id for update;
  if not found then raise exception 'group_unavailable'; end if;
  if v_group.created_by <> auth.uid() or not exists (
    select 1 from public.group_members where group_id = p_group_id
      and user_id = auth.uid() and role = 'owner' and removed_at is null
  ) then raise exception 'forbidden' using errcode = '42501'; end if;
  if v_group.deleted_at is null then return; end if;
  if v_group.deleted_at + interval '720 hours' <= clock_timestamp() then raise exception 'restore_expired'; end if;
  update public.groups set deleted_at = null where id = p_group_id;
end;
$$;
revoke all on function public.delete_group(uuid), public.restore_group(uuid) from public, anon;
grant execute on function public.delete_group(uuid), public.restore_group(uuid) to authenticated;

create or replace function private.assert_writable_list(p_list_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- Lock the list until commit: archive/member removal and writes cannot straddle authorization.
  perform 1 from public.shopping_lists l join public.group_members m on m.group_id = l.group_id
    where l.id = p_list_id and l.status = 'active' and private.is_member(l.group_id) and m.user_id = auth.uid() and m.removed_at is null
    for share of l, m;
  if not found or auth.uid() is null then raise exception 'forbidden' using errcode = '42501'; end if;
end;
$$;

create or replace function public.preview_group_invite(p_token text)
returns table (group_id uuid, group_name text, already_member boolean)
language plpgsql stable security definer set search_path = '' as $$
declare v_invite public.group_invites;
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
  if p_token !~ '^[A-Za-z0-9_-]{43}$' then raise exception 'invalid_invite'; end if;
  select * into v_invite from public.group_invites where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
  if not found then raise exception 'invalid_invite'; end if;
  if v_invite.revoked_at is not null or not exists (select 1 from public.groups where id = v_invite.group_id and deleted_at is null) then
    raise exception 'invalid_invite';
  end if;
  -- Current members may revisit a consumed invitation without consuming another use.
  if not private.is_member(v_invite.group_id) and
    (v_invite.revoked_at is not null or v_invite.expires_at <= now() or v_invite.use_count >= v_invite.max_uses) then
    raise exception 'invalid_invite';
  end if;
  return query select g.id, g.name, private.is_member(g.id) from public.groups g where g.id = v_invite.group_id;
end;
$$;

create or replace function public.accept_group_invite(p_token text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_invite public.group_invites;
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
  if p_token !~ '^[A-Za-z0-9_-]{43}$' then raise exception 'invalid_invite'; end if;
  select * into v_invite from public.group_invites
    where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex') for update;
  if not found then raise exception 'invalid_invite'; end if;
  if v_invite.revoked_at is not null or not exists (select 1 from public.groups where id = v_invite.group_id and deleted_at is null) then
    raise exception 'invalid_invite';
  end if;
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

create or replace function public.rename_group(p_group_id uuid, p_name text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.groups where id = p_group_id and deleted_at is null for update;
  if not found or not private.is_owner(p_group_id) then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.groups set name = btrim(regexp_replace(p_name, '\s+', ' ', 'g')) where id = p_group_id;
end;
$$;

-- Deleted groups are intentionally absent from the groups SELECT policy.
-- Only this checked projection exposes minimal restoration metadata to their owner.
drop function public.dashboard_groups();
create function public.dashboard_groups()
returns table (id uuid, name text, member_count bigint, remaining_count bigint,
  created_at timestamptz, deleted_at timestamptz, role text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
  return query select g.id, g.name,
    case when g.deleted_at is null then (select count(*) from public.group_members m where m.group_id = g.id and m.removed_at is null) else 0::bigint end,
    case when g.deleted_at is null then (select count(*) from public.shopping_items i join public.shopping_lists l on l.id = i.list_id
      where l.group_id = g.id and l.status = 'active' and i.deleted_at is null and not i.is_purchased) else 0::bigint end,
    g.created_at, g.deleted_at, own.role
    from public.groups g join public.group_members own on own.group_id = g.id and own.user_id = auth.uid() and own.removed_at is null
    where g.deleted_at is null or (g.created_by = auth.uid() and own.role = 'owner')
    order by g.created_at, g.id;
end;
$$;
revoke all on function public.dashboard_groups() from public, anon;
grant execute on function public.dashboard_groups() to authenticated;

create function private.purge_deleted_groups() returns integer
language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  with expired as (
    select id from public.groups where deleted_at <= clock_timestamp() - interval '720 hours'
      order by deleted_at, id limit 100 for update skip locked
  ), purged as (
    delete from public.groups where id in (select id from expired) returning id
  ) select count(*) into v_count from purged;
  return v_count;
end;
$$;
revoke all on function private.purge_deleted_groups() from public, anon, authenticated;

commit;
