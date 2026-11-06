-- Explicit author-only deletion of unfinished receipts. Existing access policies stay unchanged.
create function public.delete_receipt_draft(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare r public.receipts;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  select * into r from public.receipts where id = p_id for update;
  -- Missing rows make retries safe without revealing whether another user's receipt exists.
  if not found then return; end if;
  if r.owner_id <> auth.uid() or r.status = 'confirmed' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- The existing BEFORE DELETE trigger queues private photos for Storage API cleanup.
  delete from public.receipts where id = p_id;
end;
$$;
revoke all on function public.delete_receipt_draft(uuid) from public, anon;
grant execute on function public.delete_receipt_draft(uuid) to authenticated;
