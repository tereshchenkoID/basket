begin;

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  name_key text generated always as (lower(btrim(regexp_replace(name, '\s+', ' ', 'g')))) stored,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique nulls not distinct (owner_id, name_key)
);
insert into public.stores(name) values ('Lidl'), ('Kaufland'), ('Carrefour'), ('Auchan'), ('Penny'), ('Profi'), ('Mega Image');
alter table public.shopping_lists add column store_id uuid references public.stores(id) on delete set null;
create index shopping_lists_store on public.shopping_lists(store_id) where store_id is not null;

create table public.receipts (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  store_name_snapshot text not null default '' check (char_length(store_name_snapshot) <= 120),
  purchased_at timestamptz check (purchased_at is null or isfinite(purchased_at)),
  currency text not null default 'RON' check (currency ~ '^[A-Z]{3}$'),
  receipt_total numeric(14,2),
  adjustments jsonb not null default '[]' check (jsonb_typeof(adjustments) = 'array' and jsonb_array_length(adjustments) <= 50),
  status text not null default 'draft' check (status in ('draft','processing','review','confirmed','failed')),
  version integer not null default 0,
  has_mismatch boolean not null default false,
  discrepancy numeric(14,2) not null default 0,
  warnings jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  check (receipt_total is null or receipt_total not in ('NaN'::numeric, 'Infinity'::numeric, '-Infinity'::numeric)),
  check (status <> 'confirmed' or (receipt_total is not null and purchased_at is not null and store_name_snapshot <> ''))
);
create index receipts_history on public.receipts(purchased_at desc, id) where status = 'confirmed';
create index receipts_owner on public.receipts(owner_id, updated_at);
create index receipts_group on public.receipts(group_id) where group_id is not null;
create index receipts_store on public.receipts(store_id) where store_id is not null;

create table public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts(id) on delete cascade,
  position integer not null check (position between 0 and 499),
  original_name text not null check (char_length(original_name) <= 240),
  display_name text not null check (char_length(display_name) <= 240),
  quantity numeric(14,3) check (quantity > 0 and quantity <= 1000000 and quantity <> 'NaN'::numeric),
  unit text check (unit in ('pcs','kg','g','l','ml','pack')),
  unit_price numeric(14,2) check (unit_price >= 0 and unit_price not in ('NaN'::numeric,'Infinity'::numeric)),
  -- Net amount paid for this line. discount_amount is informative, not subtracted twice.
  line_total numeric(14,2) check (line_total not in ('NaN'::numeric,'Infinity'::numeric,'-Infinity'::numeric)),
  discount_amount numeric(14,2) not null default 0 check (discount_amount >= 0 and discount_amount not in ('NaN'::numeric,'Infinity'::numeric)),
  needs_review boolean not null default true,
  created_at timestamptz not null default now(),
  unique(receipt_id, position)
);
create table public.receipt_images (
  id uuid primary key,
  receipt_id uuid not null references public.receipts(id) on delete cascade,
  storage_path text not null unique,
  position integer not null check (position between 0 and 11),
  uploaded_at timestamptz,
  processing_status text not null default 'pending' check (processing_status in ('pending','processing','ready','failed')),
  created_at timestamptz not null default now()
);
create index receipt_images_receipt on public.receipt_images(receipt_id);
create table public.receipt_ocr_segments (
  image_id uuid primary key references public.receipt_images(id) on delete cascade,
  receipt_id uuid not null references public.receipts(id) on delete cascade,
  lines jsonb not null check (jsonb_typeof(lines) = 'array' and jsonb_array_length(lines) <= 1500),
  confidence numeric not null check (confidence between 0 and 100),
  created_at timestamptz not null default now()
);
create index receipt_segments_receipt on public.receipt_ocr_segments(receipt_id);
-- Intentionally no receipt FK: jobs survive cascades when a group/account is purged.
create table public.receipt_cleanup_jobs (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null,
  owner_id uuid not null,
  paths text[] not null,
  status text not null default 'pending' check (status in ('pending','done')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  lease_until timestamptz,
  created_at timestamptz not null default now()
);
create index receipt_cleanup_pending on public.receipt_cleanup_jobs(next_attempt_at) where status = 'pending';

create function private.can_read_receipt(p_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.receipts r where r.id = p_id and auth.uid() is not null and
   ((r.group_id is null and r.owner_id = auth.uid()) or
    (r.group_id is not null and private.is_member(r.group_id) and (r.status = 'confirmed' or r.owner_id = auth.uid()))));
$$;
create function private.owns_receipt(p_id uuid, p_draft boolean default true) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.receipts r where r.id = p_id and r.owner_id = auth.uid()
   and (not p_draft or r.status <> 'confirmed') and (r.group_id is null or private.is_member(r.group_id)));
$$;
create function private.can_use_store(p_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.stores s where s.id = p_id and auth.uid() is not null and
   (s.owner_id is null or s.owner_id = auth.uid() or exists
    (select 1 from public.shopping_lists l where l.store_id = s.id and private.is_member(l.group_id)) or exists
    (select 1 from public.receipts r where r.store_id = s.id and private.can_read_receipt(r.id))));
$$;

alter table public.stores enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;
alter table public.receipt_images enable row level security;
alter table public.receipt_ocr_segments enable row level security;
alter table public.receipt_cleanup_jobs enable row level security;
revoke all on public.stores, public.receipts, public.receipt_items, public.receipt_images, public.receipt_ocr_segments, public.receipt_cleanup_jobs from anon, authenticated;
grant select on public.stores, public.receipts, public.receipt_items, public.receipt_images, public.receipt_ocr_segments, public.receipt_cleanup_jobs to authenticated;
grant all on public.stores, public.receipts, public.receipt_items, public.receipt_images, public.receipt_ocr_segments, public.receipt_cleanup_jobs to service_role;
create policy stores_read on public.stores for select to authenticated using (private.can_use_store(id));
create policy receipts_read on public.receipts for select to authenticated using (private.can_read_receipt(id));
create policy receipt_items_read on public.receipt_items for select to authenticated using (private.can_read_receipt(receipt_id));
create policy receipt_images_read on public.receipt_images for select to authenticated using (private.owns_receipt(receipt_id,false));
create policy receipt_segments_read on public.receipt_ocr_segments for select to authenticated using (private.owns_receipt(receipt_id));
create policy receipt_cleanup_read on public.receipt_cleanup_jobs for select to authenticated using (owner_id = (select auth.uid()));

create function public.resolve_store(p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_name text := btrim(regexp_replace(p_name, '\s+', ' ', 'g')); v_id uuid;
begin
 if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
 if v_name is null or char_length(v_name) not between 1 and 120 then raise exception 'invalid' using errcode = '23514'; end if;
 select id into v_id from public.stores where lower(v_name)=name_key and private.can_use_store(id)
 order by owner_id is null desc,owner_id=auth.uid() desc,id limit 1;
 if v_id is null then
   insert into public.stores(name, owner_id) values(v_name, auth.uid())
   on conflict (owner_id, name_key) do update set name = public.stores.name returning id into v_id;
 end if;
 return v_id;
end;
$$;
create function private.set_list_store(p_list_id uuid, p_store_id uuid, p_store_name text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_store uuid := p_store_id;
begin
 perform 1 from public.shopping_lists l join public.group_members m on m.group_id = l.group_id
 where l.id = p_list_id and m.user_id = auth.uid() and m.removed_at is null and private.is_member(l.group_id) for share of l,m;
 if not found then raise exception 'forbidden' using errcode = '42501'; end if;
 if nullif(btrim(p_store_name), '') is not null then v_store := public.resolve_store(p_store_name); end if;
 if v_store is not null and not private.can_use_store(v_store) then raise exception 'forbidden' using errcode = '42501'; end if;
 update public.shopping_lists set store_id = v_store where id = p_list_id;
end;
$$;
-- Existing RPC signatures and bodies remain unchanged, including old clients.
create function public.create_list_with_store(p_id uuid, p_group_id uuid, p_title text, p_store_id uuid default null, p_store_name text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
begin
 perform public.create_shopping_list(p_id,p_group_id,p_title);
 perform private.set_list_store(p_id,p_store_id,p_store_name);
 return p_id;
end;
$$;
create function public.update_list_with_store(p_list_id uuid, p_title text default null, p_status text default null, p_store_id uuid default null, p_store_name text default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if p_title is not null or p_status is not null then perform public.update_shopping_list(p_list_id,p_title,p_status); end if;
 perform private.set_list_store(p_list_id,p_store_id,p_store_name);
end;
$$;

create function private.enqueue_receipt_cleanup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.receipt_cleanup_jobs(receipt_id,owner_id,paths)
 select old.id,old.owner_id,array_agg(storage_path) from public.receipt_images where receipt_id = old.id having count(*) > 0;
 return old;
end;
$$;
create trigger receipt_delete_cleanup before delete on public.receipts for each row execute function private.enqueue_receipt_cleanup();
create trigger receipts_updated before update on public.receipts for each row execute function private.touch_updated_at();

create function public.save_receipt(p_id uuid, p_document jsonb, p_revision integer, p_confirm boolean default false, p_correction boolean default false) returns uuid
language plpgsql security definer set search_path = '' as $$
declare r public.receipts; v_group uuid; v_store uuid; v_item jsonb; v_adjust jsonb; v_position integer := 0; v_sum numeric := 0; v_total numeric; v_diff numeric;
begin
 if auth.uid() is null then raise exception 'unauthorized' using errcode = '42501'; end if;
 if p_document is null or p_revision is null or p_revision<0 or p_confirm is null or p_correction is null or octet_length(p_document::text) > 300000 or jsonb_typeof(p_document) <> 'object' or
    (p_document - array['group_id','store_id','store_name','purchased_at','currency','receipt_total','items','adjustments','accept_mismatch','warnings','status']) <> '{}'::jsonb then
   raise exception 'invalid' using errcode = '23514';
 end if;
 insert into public.receipts(id,owner_id) values(p_id,auth.uid()) on conflict do nothing;
 select * into r from public.receipts where id = p_id for update;
 if r.owner_id <> auth.uid() or not private.owns_receipt(p_id,false) then raise exception 'forbidden' using errcode = '42501'; end if;
 if r.status = 'confirmed' and p_confirm and not p_correction then return p_id; end if;
 if (r.status = 'confirmed') <> p_correction or (p_correction and not p_confirm) then raise exception 'invalid' using errcode = '23514'; end if;
 if r.version <> p_revision then raise exception 'receipt_conflict' using errcode = '40001'; end if;
 if nullif(p_document->>'purchased_at','') is not null and (p_document->>'purchased_at') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$' then raise exception 'invalid' using errcode='23514'; end if;
 if jsonb_typeof(coalesce(p_document->'warnings','[]')) is distinct from 'array' or jsonb_array_length(coalesce(p_document->'warnings','[]'))>10
   or exists(select 1 from jsonb_array_elements_text(coalesce(p_document->'warnings','[]')) w(value) where value not in ('lowQuality','ambiguous','order','gap','limit','incomplete')) then raise exception 'invalid' using errcode='23514'; end if;
 v_group := nullif(p_document->>'group_id','')::uuid;
 if p_correction and v_group is distinct from r.group_id then raise exception 'forbidden' using errcode = '42501'; end if;
 if v_group is not null then
   perform 1 from public.groups g join public.group_members m on m.group_id=g.id
   where g.id=v_group and g.deleted_at is null and m.user_id=auth.uid() and m.removed_at is null for share of g,m;
   if not found then raise exception 'forbidden' using errcode = '42501'; end if;
 end if;
 v_store := nullif(p_document->>'store_id','')::uuid;
 if v_store is null and nullif(btrim(p_document->>'store_name'),'') is not null then v_store := public.resolve_store(p_document->>'store_name'); end if;
 if v_store is not null and not private.can_use_store(v_store) then raise exception 'forbidden' using errcode = '42501'; end if;
 if jsonb_typeof(p_document->'items') is distinct from 'array' or jsonb_array_length(p_document->'items') > 500 or
    jsonb_typeof(coalesce(p_document->'adjustments','[]')) <> 'array' or jsonb_array_length(coalesce(p_document->'adjustments','[]')) > 50 then
   raise exception 'invalid' using errcode = '23514';
 end if;
 delete from public.receipt_items where receipt_id=p_id;
 for v_item in select value from jsonb_array_elements(p_document->'items') loop
   if (v_item - array['original_name','display_name','quantity','unit','unit_price','line_total','discount_amount','needs_review']) <> '{}'::jsonb then raise exception 'invalid' using errcode='23514'; end if;
   if (nullif(v_item->>'line_total','') is not null and (v_item->>'line_total') !~ '^-?[0-9]{1,10}(\.[0-9]{1,2})?$') or
      (nullif(v_item->>'unit_price','') is not null and (v_item->>'unit_price') !~ '^[0-9]{1,10}(\.[0-9]{1,2})?$') or
      (nullif(v_item->>'discount_amount','') is not null and (v_item->>'discount_amount') !~ '^[0-9]{1,10}(\.[0-9]{1,2})?$') or
      (nullif(v_item->>'quantity','') is not null and (v_item->>'quantity') !~ '^[0-9]{1,7}(\.[0-9]{1,3})?$') then raise exception 'invalid' using errcode='23514'; end if;
   if p_confirm and (nullif(btrim(v_item->>'display_name'),'') is null or nullif(v_item->>'line_total','') is null) then raise exception 'invalid' using errcode='23514'; end if;
   insert into public.receipt_items(receipt_id,position,original_name,display_name,quantity,unit,unit_price,line_total,discount_amount,needs_review)
   values(p_id,v_position,coalesce(v_item->>'original_name',''),coalesce(v_item->>'display_name',''),nullif(v_item->>'quantity','')::numeric,
    nullif(v_item->>'unit',''),nullif(v_item->>'unit_price','')::numeric,nullif(v_item->>'line_total','')::numeric,
    coalesce(nullif(v_item->>'discount_amount','')::numeric,0),coalesce((v_item->>'needs_review')::boolean,true));
   v_sum := v_sum + coalesce(nullif(v_item->>'line_total','')::numeric,0); v_position := v_position+1;
 end loop;
 for v_adjust in select value from jsonb_array_elements(coalesce(p_document->'adjustments','[]')) loop
   if (v_adjust - array['name','amount']) <> '{}'::jsonb or (v_adjust->>'name') is null or nullif(v_adjust->>'amount','') is null or char_length(v_adjust->>'name') not between 1 and 120 or
      (v_adjust->>'amount') !~ '^-?[0-9]{1,10}(\.[0-9]{1,2})?$' then raise exception 'invalid' using errcode='23514'; end if;
   v_sum := v_sum + (v_adjust->>'amount')::numeric;
 end loop;
 if nullif(p_document->>'receipt_total','') is not null and (p_document->>'receipt_total') !~ '^-?[0-9]{1,10}(\.[0-9]{1,2})?$' then raise exception 'invalid' using errcode='23514'; end if;
 v_total := nullif(p_document->>'receipt_total','')::numeric(14,2);
 v_diff := case when v_total is null then 0 else round(v_sum,2)-v_total end;
 if p_confirm and (v_position=0 or v_total is null or nullif(p_document->>'purchased_at','') is null or
    (v_diff <> 0 and coalesce((p_document->>'accept_mismatch')::boolean,false)=false)) then raise exception 'invalid' using errcode='23514'; end if;
 update public.receipts set group_id=v_group,store_id=v_store,
   store_name_snapshot=coalesce((select name from public.stores where id=v_store),''),
   purchased_at=nullif(p_document->>'purchased_at','')::timestamptz,currency=coalesce(p_document->>'currency','RON'),receipt_total=v_total,
   adjustments=coalesce(p_document->'adjustments','[]'),warnings=coalesce(p_document->'warnings','[]'),
   has_mismatch=v_diff<>0,discrepancy=v_diff,version=version+1,
   status=case when p_confirm then 'confirmed' else case when p_document->>'status' in ('draft','processing','review','failed') then p_document->>'status' else 'draft' end end,
   confirmed_at=case when p_confirm then coalesce(confirmed_at,clock_timestamp()) else null end
 where id=p_id;
 if p_confirm and not p_correction then
   if exists(select 1 from public.receipt_images where receipt_id=p_id and uploaded_at is null) then raise exception 'invalid' using errcode='23514'; end if;
   insert into public.receipt_cleanup_jobs(receipt_id,owner_id,paths)
   select p_id,auth.uid(),array_agg(storage_path) from public.receipt_images where receipt_id=p_id having count(*)>0;
   delete from public.receipt_ocr_segments where receipt_id=p_id;
 end if;
 return p_id;
end;
$$;

create function public.prepare_receipt_image(p_receipt_id uuid,p_image_id uuid,p_position integer,p_replace_id uuid default null) returns text
language plpgsql security definer set search_path = '' as $$
declare v_path text;
begin
 perform 1 from public.receipts where id=p_receipt_id for update;
 if not private.owns_receipt(p_receipt_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if exists(select 1 from public.receipt_images where id=p_image_id and receipt_id<>p_receipt_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if p_replace_id is not null and not exists(select 1 from public.receipt_images where id=p_replace_id and receipt_id=p_receipt_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if (select count(*) from public.receipt_images where receipt_id=p_receipt_id) >= (case when p_replace_id is not null then 13 else 12 end) and not exists(select 1 from public.receipt_images where id=p_image_id) then raise exception 'invalid' using errcode='23514'; end if;
 v_path := auth.uid()::text||'/'||p_receipt_id::text||'/'||p_image_id::text||'.jpg';
 insert into public.receipt_images(id,receipt_id,storage_path,position) values(p_image_id,p_receipt_id,v_path,p_position)
 on conflict(id) do update set position=excluded.position;
 update public.receipts set updated_at=clock_timestamp() where id=p_receipt_id;
 return v_path;
end;
$$;
create function public.complete_receipt_upload(p_receipt_id uuid,p_image_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 perform 1 from public.receipts where id=p_receipt_id for update;
 if not private.owns_receipt(p_receipt_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if not exists(select 1 from public.receipt_images i join storage.objects o on o.bucket_id='receipt-images' and o.name=i.storage_path
   where i.id=p_image_id and i.receipt_id=p_receipt_id) then raise exception 'invalid' using errcode='23514'; end if;
 update public.receipt_images set uploaded_at=clock_timestamp() where id=p_image_id and receipt_id=p_receipt_id;
 update public.receipts set updated_at=clock_timestamp() where id=p_receipt_id;
end;
$$;
create function public.save_receipt_segment(p_receipt_id uuid,p_image_id uuid,p_lines jsonb,p_confidence numeric,p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
 perform 1 from public.receipts where id=p_receipt_id for update;
 if not private.owns_receipt(p_receipt_id) or not exists(select 1 from public.receipt_images where id=p_image_id and receipt_id=p_receipt_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if p_status not in ('processing','ready','failed','pending') or p_confidence not between 0 and 100 or octet_length(p_lines::text)>100000 then raise exception 'invalid' using errcode='23514'; end if;
 if p_status in ('processing','pending') then
   update public.receipt_images set processing_status=p_status where id=p_image_id;
   update public.receipts set status=case when p_status='processing' then 'processing' else 'draft' end,updated_at=clock_timestamp() where id=p_receipt_id;
   return;
 end if;
 -- Never retain card/payment identifiers in temporary OCR text.
 insert into public.receipt_ocr_segments(image_id,receipt_id,lines,confidence)
 values(p_image_id,p_receipt_id,coalesce((select jsonb_agg(value) from jsonb_array_elements_text(p_lines) where char_length(value)<=500 and value !~* '(\m(card|visa|mastercard|iban|rrn|stan|cui|cif|numerar|cash|tranzactie)\M|[0-9]{12,})'),'[]'),p_confidence)
 on conflict(image_id) do update set lines=excluded.lines,confidence=excluded.confidence;
 update public.receipt_images set processing_status=p_status where id=p_image_id;
 update public.receipts set status=case when p_status='failed' then 'failed' else 'review' end,updated_at=clock_timestamp() where id=p_receipt_id;
end;
$$;
create function public.remove_receipt_image(p_receipt_id uuid,p_image_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 perform 1 from public.receipts where id=p_receipt_id for update;
 if not private.owns_receipt(p_receipt_id) then raise exception 'forbidden' using errcode='42501'; end if;
 insert into public.receipt_cleanup_jobs(receipt_id,owner_id,paths)
 select p_receipt_id,auth.uid(),array[storage_path] from public.receipt_images where id=p_image_id and receipt_id=p_receipt_id;
 delete from public.receipt_images where id=p_image_id and receipt_id=p_receipt_id;
 update public.receipts set updated_at=clock_timestamp() where id=p_receipt_id;
end;
$$;
create function public.finish_receipt_cleanup(p_job_id uuid,p_success boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare j public.receipt_cleanup_jobs;
begin
 select * into j from public.receipt_cleanup_jobs where id=p_job_id for update;
 if not found then return; end if;
 if auth.role() is distinct from 'service_role' and j.owner_id is distinct from auth.uid() then raise exception 'forbidden' using errcode='42501'; end if;
 if j.status='done' then return; end if;
 if p_success then
   if exists(select 1 from storage.objects where bucket_id='receipt-images' and name=any(j.paths)) then raise exception 'invalid' using errcode='23514'; end if;
   delete from public.receipt_images where receipt_id=j.receipt_id and storage_path=any(j.paths);
   update public.receipt_cleanup_jobs set status='done',paths='{}',lease_until=null where id=p_job_id;
 else
   update public.receipt_cleanup_jobs set attempts=attempts+1,next_attempt_at=clock_timestamp()+make_interval(mins=>least(1440, power(2,least(attempts,10))::integer)),lease_until=null where id=p_job_id;
 end if;
end;
$$;
create function public.claim_receipt_cleanup() returns setof public.receipt_cleanup_jobs
language plpgsql security definer set search_path = '' as $$
begin
 -- Called only with a server secret; no Storage metadata is deleted in SQL.
 delete from public.receipts where id in (select id from public.receipts where status<>'confirmed' and updated_at<clock_timestamp()-interval '24 hours' order by updated_at for update skip locked limit 100);
 -- Reconcile late/orphaned uploads using metadata reads; actual deletion still uses Storage API.
 insert into public.receipt_cleanup_jobs(receipt_id,owner_id,paths)
 select ((storage.foldername(o.name))[2])::uuid,((storage.foldername(o.name))[1])::uuid,array[o.name]
 from storage.objects o where o.bucket_id='receipt-images' and o.created_at<clock_timestamp()-interval '1 hour'
   and o.name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f-]{36}\.jpg$'
   and not exists(select 1 from public.receipt_images i where i.storage_path=o.name)
   and not exists(select 1 from public.receipt_cleanup_jobs j where j.status='pending' and o.name=any(j.paths));
 delete from public.receipt_cleanup_jobs where status='done'  and created_at<clock_timestamp()-interval '7 days';
 return query update public.receipt_cleanup_jobs set lease_until=clock_timestamp()+interval '5 minutes'
 where id in (select id from public.receipt_cleanup_jobs where status='pending' and next_attempt_at<=now()
   and (lease_until is null or lease_until<now()) order by created_at for update skip locked limit 50) returning *;
end;
$$;

create function public.receipt_detail(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r public.receipts;
begin
 if not private.can_read_receipt(p_id) then raise exception 'forbidden' using errcode='42501'; end if;
 select * into r from public.receipts where id=p_id;
 return to_jsonb(r)||jsonb_build_object('receipt_total',r.receipt_total::text,'discrepancy',r.discrepancy::text,
 'author_name',(select display_name from public.profiles where id=r.owner_id),
 'items',coalesce((select jsonb_agg(to_jsonb(i)||jsonb_build_object('quantity',i.quantity::text,'unit_price',i.unit_price::text,'line_total',i.line_total::text,'discount_amount',i.discount_amount::text) order by i.position) from public.receipt_items i where receipt_id=p_id),'[]'));
end;
$$;
create function public.receipt_history(p_store_id uuid default null,p_group_id uuid default null,p_personal boolean default false,p_from date default null,p_until date default null,p_offset integer default 0,p_limit integer default 25,p_ascending boolean default false)
returns table(id uuid,owner_id uuid,group_id uuid,store_id uuid,store_name_snapshot text,purchased_at timestamptz,currency text,receipt_total text,item_count bigint,author_name text,group_name text,total_count bigint)
language sql stable security definer set search_path = '' as $$
 select r.id,r.owner_id,r.group_id,r.store_id,r.store_name_snapshot,r.purchased_at,r.currency,r.receipt_total::text,
   (select count(*) from public.receipt_items i where i.receipt_id=r.id),p.display_name,g.name,count(*) over()
 from public.receipts r join public.profiles p on p.id=r.owner_id left join public.groups g on g.id=r.group_id
 where r.status='confirmed' and private.can_read_receipt(r.id)
   and (p_store_id is null or r.store_id=p_store_id) and (p_group_id is null or r.group_id=p_group_id)
   and (not p_personal or r.group_id is null) and (p_from is null or r.purchased_at>=(p_from::timestamp at time zone 'Europe/Bucharest')) and (p_until is null or r.purchased_at<((p_until+1)::timestamp at time zone 'Europe/Bucharest'))
 order by case when p_ascending then r.purchased_at end asc,case when not p_ascending then r.purchased_at end desc,r.id
 limit greatest(1,least(p_limit,100)) offset greatest(0,p_offset);
$$;

create function private.can_read_receipt_image(p_path text) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
   exists(select 1 from public.receipt_images i where i.storage_path=p_path and private.owns_receipt(i.receipt_id,false))
   or exists(select 1 from public.receipt_cleanup_jobs j where j.owner_id=auth.uid() and p_path=any(j.paths)
     and (not exists(select 1 from public.receipts r where r.id=j.receipt_id) or private.owns_receipt(j.receipt_id,false)))
 );
$$;
revoke all on function private.can_read_receipt_image(text) from public,anon;
grant execute on function private.can_read_receipt_image(text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('receipt-images','receipt-images',false,3145728,array['image/jpeg']) on conflict(id) do nothing;
create policy receipt_storage_read on storage.objects for select to authenticated using (
 bucket_id='receipt-images' and private.can_read_receipt_image(name)
);
create policy receipt_storage_upload on storage.objects for insert to authenticated with check (
 bucket_id='receipt-images' and (storage.foldername(name))[1]=auth.uid()::text and exists
 (select 1 from public.receipt_images i where i.storage_path=name and private.owns_receipt(i.receipt_id))
);
create policy receipt_storage_delete on storage.objects for delete to authenticated using (
 bucket_id='receipt-images' and (storage.foldername(name))[1]=auth.uid()::text
);

-- Explicit grants for new functions only. No changes to existing RPCs or group RLS.
revoke all on function private.can_read_receipt(uuid),private.owns_receipt(uuid,boolean),private.can_use_store(uuid),private.set_list_store(uuid,uuid,text),private.enqueue_receipt_cleanup() from public,anon,authenticated;
grant execute on function private.can_read_receipt(uuid),private.owns_receipt(uuid,boolean),private.can_use_store(uuid) to authenticated;
revoke all on function public.resolve_store(text),public.create_list_with_store(uuid,uuid,text,uuid,text),public.update_list_with_store(uuid,text,text,uuid,text),
 public.save_receipt(uuid,jsonb,integer,boolean,boolean),public.prepare_receipt_image(uuid,uuid,integer,uuid),public.save_receipt_segment(uuid,uuid,jsonb,numeric,text),
 public.complete_receipt_upload(uuid,uuid),public.remove_receipt_image(uuid,uuid),public.finish_receipt_cleanup(uuid,boolean),public.claim_receipt_cleanup(),public.receipt_detail(uuid),
 public.receipt_history(uuid,uuid,boolean,date,date,integer,integer,boolean) from public,anon,authenticated;
grant execute on function public.resolve_store(text),public.create_list_with_store(uuid,uuid,text,uuid,text),public.update_list_with_store(uuid,text,text,uuid,text),
 public.save_receipt(uuid,jsonb,integer,boolean,boolean),public.prepare_receipt_image(uuid,uuid,integer,uuid),public.save_receipt_segment(uuid,uuid,jsonb,numeric,text),
 public.complete_receipt_upload(uuid,uuid),public.remove_receipt_image(uuid,uuid),public.finish_receipt_cleanup(uuid,boolean),public.receipt_detail(uuid),
 public.receipt_history(uuid,uuid,boolean,date,date,integer,integer,boolean) to authenticated;
grant execute on function public.claim_receipt_cleanup(),public.finish_receipt_cleanup(uuid,boolean) to service_role;
commit;
