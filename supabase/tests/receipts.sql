-- Run only in an isolated local database with all migrations applied.
-- The harness must set basket.test_receipts = 'isolated'. No production data is used.
begin;
do $$begin if current_setting('basket.test_receipts',true) is distinct from 'isolated' then raise exception 'Isolated test database required'; end if; end$$;
create function pg_temp.check_result(value boolean, message text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'ASSERT: %',message; end if; end$$;
insert into auth.users(id,raw_user_meta_data) values
 ('a0000000-0000-4000-8000-000000000001','{"name":"Owner"}'),
 ('a0000000-0000-4000-8000-000000000002','{"name":"Member"}'),
 ('a0000000-0000-4000-8000-000000000003','{"name":"Outsider"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claim.role','authenticated',true);
select public.create_group('b0000000-0000-4000-8000-000000000001','Family','Shopping');
select public.create_shopping_list('c0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','Old API');
select pg_temp.check_result((select store_id is null from public.shopping_lists where id='c0000000-0000-4000-8000-000000000001'),'old list has no required store');
select public.create_group_invite('b0000000-0000-4000-8000-000000000001',encode(sha256(convert_to(repeat('x',43),'UTF8')),'hex'));
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000002',true);
select public.accept_group_invite(repeat('x',43));
select public.accept_group_invite(repeat('x',43));
select public.add_shopping_item('d0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','Milk',2,'l');
select public.edit_shopping_item('d0000000-0000-4000-8000-000000000001','Milk',0.750,'kg');
select public.set_item_purchased('d0000000-0000-4000-8000-000000000001',true);
select pg_temp.check_result((select is_purchased and quantity=0.750 from public.shopping_items where id='d0000000-0000-4000-8000-000000000001'),'old item edit/purchase works');
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select pg_temp.check_result(public.resolve_store('  lIdL  ')=public.resolve_store('Lidl'),'system store normalized');
select pg_temp.check_result(public.resolve_store('Local   Shop')=public.resolve_store('local shop'),'custom store normalized');
select public.create_list_with_store('c0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001','New API',null,'Local Shop');
select public.update_list_with_store('c0000000-0000-4000-8000-000000000002','Renamed',null,null,null);
select pg_temp.check_result((select title='Renamed' and store_id is null from public.shopping_lists where id='c0000000-0000-4000-8000-000000000002'),'optional store can be cleared');
-- Personal draft with one weighted item.
select public.save_receipt('e0000000-0000-4000-8000-000000000001',
 '{"store_name":"Lidl","currency":"RON","purchased_at":"2026-11-04T12:00:00Z","receipt_total":"18.74","items":[{"original_name":"MERE","display_name":"Apples","quantity":"0.750","unit":"kg","unit_price":"24.99","line_total":"18.74","discount_amount":"0.00"}],"adjustments":[]}',0,false,false);
select public.prepare_receipt_image('e0000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001',0);
insert into storage.objects(bucket_id,name) select 'receipt-images',storage_path from public.receipt_images where id='f0000000-0000-4000-8000-000000000001';
select public.complete_receipt_upload('e0000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001');
select public.save_receipt_segment('e0000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001','["VISA 1234567890123456","MERE 18.74"]',90,'ready');
select pg_temp.check_result((select lines='["MERE 18.74"]'::jsonb from public.receipt_ocr_segments where image_id='f0000000-0000-4000-8000-000000000001'),'payment text is not retained');
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000003',true);
select pg_temp.check_result((select count(*)=0 from public.receipts),'outsider cannot read private receipt');
select pg_temp.check_result((select count(*)=0 from storage.objects),'outsider cannot read private photo');
do $$begin
 begin perform public.receipt_detail('e0000000-0000-4000-8000-000000000001');raise exception 'ASSERT: foreign detail allowed';exception when insufficient_privilege then null;end;
 begin perform public.prepare_receipt_image('e0000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000002',1);raise exception 'ASSERT: foreign upload allowed';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
-- A rejected confirmation must keep both images and draft data.
do $$begin
 begin perform public.save_receipt('e0000000-0000-4000-8000-000000000001','{"store_name":"Lidl","receipt_total":"19.00","currency":"RON","purchased_at":"2026-11-04T12:00:00Z","items":[{"original_name":"MERE","display_name":"Apples","line_total":"18.74"}],"adjustments":[]}',1,true,false);raise exception 'ASSERT: mismatch accepted';exception when check_violation then null;end;
end$$;
select pg_temp.check_result((select count(*)=1 from storage.objects),'failed confirmation keeps images');
select pg_temp.check_result((select status='review' and version=1 from public.receipts where id='e0000000-0000-4000-8000-000000000001'),'failed confirmation atomic rollback');
select public.save_receipt('e0000000-0000-4000-8000-000000000001','{"store_name":"Lidl","receipt_total":"18.74","currency":"RON","purchased_at":"2026-11-04T12:00:00Z","items":[{"original_name":"MERE","display_name":"Apples","quantity":"0.750","unit":"kg","unit_price":"24.99","line_total":"18.74"}],"adjustments":[]}',1,true,false);
select public.save_receipt('e0000000-0000-4000-8000-000000000001','{}',1,true,false);
select pg_temp.check_result((select count(*)=1 from public.receipt_items where receipt_id='e0000000-0000-4000-8000-000000000001'),'duplicate confirmation does not duplicate purchase/items');
select pg_temp.check_result((select count(*)=1 from public.receipt_cleanup_jobs),'cleanup queued once');
select pg_temp.check_result((select count(*)=0 from public.receipt_ocr_segments),'temporary OCR cleared');
do $$begin
 begin perform public.finish_receipt_cleanup((select id from public.receipt_cleanup_jobs limit 1),true);raise exception 'ASSERT: cleanup succeeded without Storage removal';exception when check_violation then null;end;
end$$;
select public.finish_receipt_cleanup((select id from public.receipt_cleanup_jobs limit 1),false);
select pg_temp.check_result((select attempts=1 and status='pending' from public.receipt_cleanup_jobs limit 1),'Storage failure keeps confirmed purchase and retry job');
delete from storage.objects where bucket_id='receipt-images';
select public.finish_receipt_cleanup((select id from public.receipt_cleanup_jobs limit 1),true);
select public.finish_receipt_cleanup((select id from public.receipt_cleanup_jobs limit 1),true);
select pg_temp.check_result((select status='done' and cardinality(paths)=0 from public.receipt_cleanup_jobs limit 1),'cleanup idempotent and clears paths');
-- Group receipt: explicit mismatch acknowledgment; author-only correction.
select public.save_receipt('e0000000-0000-4000-8000-000000000002','{"group_id":"b0000000-0000-4000-8000-000000000001","store_name":"Lidl","currency":"RON","purchased_at":"2026-11-04T12:00:00Z","receipt_total":"19.00","accept_mismatch":true,"items":[{"original_name":"MERE","display_name":"Apples","line_total":"18.74"}],"adjustments":[]}',0,true,false);
select pg_temp.check_result((select has_mismatch and discrepancy=-0.26 from public.receipts where id='e0000000-0000-4000-8000-000000000002'),'mismatch persisted exactly');
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000002',true);
select pg_temp.check_result((select count(*)=1 from public.receipts),'member reads group receipt but not personal');
do $$begin
 begin perform public.save_receipt('e0000000-0000-4000-8000-000000000002','{}',1,true,true);raise exception 'ASSERT: foreign correction allowed';exception when insufficient_privilege then null;end;
 begin perform public.save_receipt('e0000000-0000-4000-8000-000000000003','{"owner_id":"a0000000-0000-4000-8000-000000000001","items":[]}',0);raise exception 'ASSERT: owner spoof accepted';exception when check_violation then null;end;
end$$;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000003',true);
do $$begin
 begin perform public.save_receipt('e0000000-0000-4000-8000-000000000003','{"group_id":"b0000000-0000-4000-8000-000000000001","items":[]}',0);raise exception 'ASSERT: group spoof accepted';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select public.save_receipt('e0000000-0000-4000-8000-000000000002','{"group_id":"b0000000-0000-4000-8000-000000000001","store_name":"Lidl","currency":"RON","purchased_at":"2026-11-04T12:00:00Z","receipt_total":"18.74","items":[{"original_name":"MERE","display_name":"Apples","line_total":"18.74"}],"adjustments":[]}',1,true,true);
select pg_temp.check_result((select count(*)=2 from public.receipt_history()),'history does not duplicate author and group expenses');
select pg_temp.check_result((select count(*)=1 from public.receipt_history(p_personal=>true)),'personal filter');
select pg_temp.check_result((select count(*)=1 from public.receipt_history(p_group_id=>'b0000000-0000-4000-8000-000000000001')),'group filter');
select pg_temp.check_result((select count(*)=0 from public.receipt_history(p_from=>'2026-11-05')),'date filter');
select public.update_shopping_list('c0000000-0000-4000-8000-000000000001',null,'archived');
select pg_temp.check_result((select count(*)=2 from public.receipt_history()),'archive does not delete history');
select public.update_shopping_list('c0000000-0000-4000-8000-000000000001',null,'active');
select public.delete_shopping_item('d0000000-0000-4000-8000-000000000001');
select pg_temp.check_result((select deleted_at is not null from public.shopping_items where id='d0000000-0000-4000-8000-000000000001'),'old item deletion works');
select public.delete_group('b0000000-0000-4000-8000-000000000001');
select pg_temp.check_result((select count(*)=1 from public.receipts),'deleted group hides its history from author');
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000002',true);
select pg_temp.check_result((select count(*)=0 from public.receipts),'deleted group hides history from member');
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select public.restore_group('b0000000-0000-4000-8000-000000000001');
select pg_temp.check_result((select count(*)=2 from public.receipt_history()),'restoration returns group history');
select pg_temp.check_result((select bool_and(revoked_at is not null) from public.group_invites),'restoration does not reactivate old invite');
select public.remove_group_member('b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000002');
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000002',true);
select pg_temp.check_result((select count(*)=0 from public.receipt_history()),'removed member loses history access');
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select public.save_receipt('e0000000-0000-4000-8000-000000000005','{"store_name":"Kaufland","currency":"RON","purchased_at":"2026-11-05T12:00:00Z","receipt_total":"19.49","items":[{"original_name":"MERE","display_name":"Apples","quantity":"0.750","unit":"kg","unit_price":"25.99","line_total":"19.49"}],"adjustments":[]}',0,true,false);
select pg_temp.check_result((select count(distinct unit_price)=2 from public.receipt_items where original_name='MERE' and unit_price is not null),'same product keeps prices from different stores/dates');
select pg_temp.check_result((select count(*)=1 from public.receipt_history(p_store_id=>public.resolve_store('Kaufland'))),'store filter');
do $$begin
 begin perform public.save_receipt('e0000000-0000-4000-8000-000000000005','{"items":[]}',null,false,null);raise exception 'ASSERT: null correction flags accepted';exception when check_violation then null;end;
 begin perform public.save_receipt('e0000000-0000-4000-8000-000000000005','{"items":[]}',0,true,true);raise exception 'ASSERT: stale revision accepted';exception when serialization_failure then null;end;
 begin insert into public.receipts(id,owner_id) values(gen_random_uuid(),auth.uid());raise exception 'ASSERT: direct receipt write allowed';exception when insufficient_privilege then null;end;
end$$;
select pg_temp.check_result((select is_nullable='YES' and column_default is null from information_schema.columns where table_schema='public' and table_name='shopping_lists' and column_name='store_id'),'existing lists get nullable optional store only');
reset role;
insert into public.receipts(id,owner_id,updated_at) values('e0000000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000001',now()-interval '25 hours');
insert into public.receipt_images(id,receipt_id,storage_path,position) values('f0000000-0000-4000-8000-000000000004','e0000000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000001/expired/test.jpg',0);
set local role service_role;
select set_config('request.jwt.claim.role','service_role',true);
select count(*) from public.claim_receipt_cleanup();
reset role;
select pg_temp.check_result(not exists(select 1 from public.receipts where id='e0000000-0000-4000-8000-000000000004'),'24h abandoned draft expiration');
select pg_temp.check_result(exists(select 1 from public.receipt_cleanup_jobs where receipt_id='e0000000-0000-4000-8000-000000000004' and paths=array['a0000000-0000-4000-8000-000000000001/expired/test.jpg']),'cleanup job survives receipt deletion');
select pg_temp.check_result(not has_function_privilege('authenticated','public.claim_receipt_cleanup()','execute'),'cleanup worker is privileged');
select pg_temp.check_result(not has_function_privilege('anon','public.save_receipt(uuid,jsonb,integer,boolean,boolean)','execute'),'anonymous receipt writes denied');
-- Draft deletion: author only, confirmation race protected by the row lock, durable cleanup.
insert into public.receipts(id,owner_id) values
 ('e0000000-0000-4000-8000-000000000010','a0000000-0000-4000-8000-000000000001');
insert into public.receipt_images(id,receipt_id,storage_path,position) values
 ('f0000000-0000-4000-8000-000000000010','e0000000-0000-4000-8000-000000000010','a0000000-0000-4000-8000-000000000001/e0000000-0000-4000-8000-000000000010/f0000000-0000-4000-8000-000000000010.jpg',0);
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000003',true);
do $$begin
 begin perform public.delete_receipt_draft('e0000000-0000-4000-8000-000000000010');raise exception 'ASSERT: outsider deleted draft';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
do $$begin
 begin perform public.delete_receipt_draft('e0000000-0000-4000-8000-000000000005');raise exception 'ASSERT: confirmed receipt deleted';exception when insufficient_privilege then null;end;
end$$;
select public.delete_receipt_draft('e0000000-0000-4000-8000-000000000010');
select public.delete_receipt_draft('e0000000-0000-4000-8000-000000000010');
select pg_temp.check_result(not exists(select 1 from public.receipts where id='e0000000-0000-4000-8000-000000000010'),'draft deleted, retry safe');
select pg_temp.check_result(exists(select 1 from public.receipt_cleanup_jobs where receipt_id='e0000000-0000-4000-8000-000000000010' and cardinality(paths)=1),'draft deletion queues photos');
select pg_temp.check_result(not has_function_privilege('anon','public.delete_receipt_draft(uuid)','execute'),'anonymous deletion denied');
rollback;
