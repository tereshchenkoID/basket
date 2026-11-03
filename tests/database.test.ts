import assert from 'node:assert/strict'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { test } from 'node:test'

import { testDatabase } from './helpers/postgres'

const freshToken = () => randomBytes(32).toString('base64url')
const hash = (token: string) => createHash('sha256').update(token).digest('hex')

test(
  'real PostgreSQL: RLS, privileges, invitations, concurrent writes',
  { timeout: 120000 },
  async (t) => {
    const db = await testDatabase()
    t.after(() => db.close())
    const ids = Array.from({ length: 4 }, () => randomUUID())
    const [a, b] = ids
    // Existing Google users must be backfilled, new users must get a profile via trigger.
    await db.admin.query(
      'insert into auth.users(id,raw_user_meta_data) values($1,\'{"full_name":"User A"}\')',
      [a],
    )
    await db.migrate()
    for (const id of ids.slice(1))
      await db.admin.query('insert into auth.users(id) values($1)', [id])
    const [A, B, C, D, anon] = await Promise.all([...ids.map((id) => db.asUser(id)), db.asUser()])
    const groupId = randomUUID()
    let listId: string

    await t.test('profile trigger/backfill, own-only RLS, anonymous denied', async () => {
      assert.equal((await db.admin.query('select * from public.profiles')).rowCount, 4)
      assert.equal((await A.query('select * from public.profiles')).rowCount, 1)
      assert.equal(
        (await A.query('update public.profiles set display_name=$1 where id=$2', ['mine', a]))
          .rowCount,
        1,
      )
      assert.equal(
        (await B.query('update public.profiles set display_name=$1 where id=$2', ['stolen', a]))
          .rowCount,
        0,
      )
      await assert.rejects(anon.query('select * from public.profiles'), { code: '42501' })
      await assert.rejects(
        anon.query('select public.create_group($1,$2,$3)', [randomUUID(), 'bad', 'bad']),
        { code: '42501' },
      )
    })
    await t.test(
      'group + exactly one owner + translated first list are atomic and idempotent',
      async () => {
        await A.query('select public.create_group($1,$2,$3)', [
          groupId,
          '  Our   family  ',
          'Покупки',
        ])
        await A.query('select public.create_group($1,$2,$3)', [groupId, 'retry', 'retry'])
        assert.equal(
          (await A.query('select name from public.groups where id=$1', [groupId])).rows[0].name,
          'Our family',
        )
        assert.equal(
          (await A.query('select * from public.group_members where group_id=$1', [groupId]))
            .rowCount,
          1,
        )
        const lists = await A.query('select * from public.shopping_lists where group_id=$1', [
          groupId,
        ])
        assert.equal(lists.rowCount, 1)
        assert.equal(lists.rows[0].title, 'Покупки')
        listId = lists.rows[0].id
        const failedId = randomUUID()
        await assert.rejects(
          A.query('select public.create_group($1,$2,$3)', [failedId, 'atomic', '']),
        )
        assert.equal(
          (await db.admin.query('select * from public.groups where id=$1', [failedId])).rowCount,
          0,
        )
        await assert.rejects(
          A.query('select public.remove_group_member($1,$2)', [groupId, a]),
          /owner_cannot_leave/,
        )
      },
    )
    await t.test(
      'other users cannot read private group/list/member/profile data or mutate through direct SQL/REST roles',
      async () => {
        assert.equal((await B.query('select * from public.groups')).rowCount, 0)
        assert.equal((await B.query('select * from public.shopping_lists')).rowCount, 0)
        assert.equal((await B.query('select * from public.group_members')).rowCount, 0)
        await assert.rejects(B.query('select public.group_member_profiles($1)', [groupId]), {
          code: '42501',
        })
        await assert.rejects(
          B.query('insert into public.group_members(group_id,user_id,role) values($1,$2,\'owner\')', [
            groupId,
            b,
          ]),
          { code: '42501' },
        )
        await assert.rejects(
          A.query('update public.group_members set role=\'owner\' where user_id=$1', [b]),
          { code: '42501' },
        )
        await assert.rejects(B.query('select public.rename_group($1,$2)', [groupId, 'stolen']), {
          code: '42501',
        })
        await assert.rejects(
          B.query('select public.create_shopping_list($1,$2,$3)', [
            randomUUID(),
            groupId,
            'stolen',
          ]),
          { code: '42501' },
        )
        await assert.rejects(
          B.query('select public.add_shopping_item($1,$2,$3,$4,$5)', [
            randomUUID(),
            listId,
            'stolen',
            1,
            'pcs',
          ]),
          { code: '42501' },
        )
      },
    )
    await t.test(
      'hash-only invitation, authenticated preview does not disclose members/lists before acceptance',
      async () => {
        const token = freshToken()
        await A.query('select public.create_group_invite($1,$2)', [groupId, hash(token)])
        const row = (
          await db.admin.query('select * from public.group_invites where token_hash=$1', [
            hash(token),
          ])
        ).rows[0]
        assert.equal(Object.values(row).includes(token), false)
        assert.equal(row.max_uses, 1)
        assert.ok(new Date(row.expires_at).getTime() > Date.now() + 6 * 86400000)
        const preview = await B.query('select * from public.preview_group_invite($1)', [token])
        assert.deepEqual(Object.keys(preview.rows[0]).sort(), [
          'already_member',
          'group_id',
          'group_name',
        ])
        assert.equal((await B.query('select * from public.shopping_lists')).rowCount, 0)
        await B.query('select public.accept_group_invite($1)', [token])
        await B.query('select public.accept_group_invite($1)', [token])
        assert.equal(
          (await A.query('select * from public.group_members where user_id=$1', [b])).rowCount,
          1,
        )
        assert.equal(
          (
            await A.query('select use_count from public.group_invites where token_hash=$1', [
              hash(token),
            ])
          ).rows[0].use_count,
          1,
        )
        assert.equal((await B.query('select * from public.shopping_lists')).rowCount, 1)
        assert.equal((await B.query('select * from public.group_invites')).rowCount, 0)
        await assert.rejects(
          B.query('update public.group_members set role=\'owner\' where user_id=$1', [b]),
          { code: '42501' },
        )
        await assert.rejects(
          B.query('select public.create_group_invite($1,$2)', [groupId, hash(freshToken())]),
          { code: '42501' },
        )
        await assert.rejects(B.query('select public.remove_group_member($1,$2)', [groupId, a]), {
          code: '42501',
        })
      },
    )
    await t.test('expired, revoked, fabricated and consumed invitations are rejected', async () => {
      for (const kind of ['expired', 'revoked']) {
        const token = freshToken()
        const created = await A.query('select public.create_group_invite($1,$2) as id', [
          groupId,
          hash(token),
        ])
        if (kind === 'expired')
          await db.admin.query(
            'update public.group_invites set expires_at=now()-interval \'1 second\' where id=$1',
            [created.rows[0].id],
          )
        else await A.query('select public.revoke_group_invite($1)', [created.rows[0].id])
        await assert.rejects(
          C.query('select public.preview_group_invite($1)', [token]),
          /invalid_invite/,
        )
        await assert.rejects(
          C.query('select public.accept_group_invite($1)', [token]),
          /invalid_invite/,
        )
      }
      await assert.rejects(
        C.query('select public.accept_group_invite($1)', [groupId]),
        /invalid_invite/,
      )
      await assert.rejects(
        C.query('select public.accept_group_invite($1)', [freshToken()]),
        /invalid_invite/,
      )
    })
    await t.test('simultaneous acceptance cannot exceed the single-use limit', async () => {
      const token = freshToken()
      await A.query('select public.create_group_invite($1,$2)', [groupId, hash(token)])
      const results = await Promise.allSettled([
        C.query('select public.accept_group_invite($1)', [token]),
        D.query('select public.accept_group_invite($1)', [token]),
      ])
      assert.equal(results.filter((value) => value.status === 'fulfilled').length, 1)
      assert.equal(results.filter((value) => value.status === 'rejected').length, 1)
      assert.equal(
        (
          await A.query('select use_count from public.group_invites where token_hash=$1', [
            hash(token),
          ])
        ).rows[0].use_count,
        1,
      )
    })
    await t.test(
      'items validate, preserve intentional duplicates and deduplicate concurrent retries',
      async () => {
        const id = randomUUID()
        const A2 = await db.asUser(a)
        await Promise.all([
          A.query('select public.add_shopping_item($1,$2,$3,$4,$5)', [
            id,
            listId,
            'Milk',
            1.5,
            'l',
          ]),
          A2.query('select public.add_shopping_item($1,$2,$3,$4,$5)', [
            id,
            listId,
            'Milk',
            1.5,
            'l',
          ]),
        ])
        assert.equal(
          (await A.query('select * from public.shopping_items where id=$1', [id])).rowCount,
          1,
        )
        await A.query('select public.add_shopping_item($1,$2,$3,$4,$5)', [
          randomUUID(),
          listId,
          'Milk',
          1.5,
          'l',
        ])
        assert.equal(
          (await A.query('select * from public.shopping_items where name=\'Milk\'')).rowCount,
          2,
        )
        for (const [name, quantity, unit] of [
          ['', 1, 'pcs'],
          ['empty', 0, 'pcs'],
          ['negative', -1, 'pcs'],
          ['invalid', 1, 'eur'],
          ['nan', 'NaN', 'pcs'],
        ]) {
          await assert.rejects(
            A.query('select public.add_shopping_item($1,$2,$3,$4,$5)', [
              randomUUID(),
              listId,
              name,
              quantity,
              unit,
            ]),
          )
        }
        await assert.rejects(
          B.query('update public.shopping_items set created_by=$1, list_id=$2 where id=$3', [
            a,
            randomUUID(),
            id,
          ]),
          { code: '42501' },
        )
      },
    )
    await t.test(
      'purchase attribution, unchecking, two-user edits and archived protection',
      async () => {
        const id = (await A.query('select id from public.shopping_items limit 1')).rows[0].id
        await B.query('select public.set_item_purchased($1,true)', [id])
        let row = (await A.query('select * from public.shopping_items where id=$1', [id])).rows[0]
        assert.equal(row.purchased_by, b)
        assert.ok(row.purchased_at)
        await B.query('select public.set_item_purchased($1,false)', [id])
        row = (await A.query('select * from public.shopping_items where id=$1', [id])).rows[0]
        assert.equal(row.purchased_by, null)
        assert.equal(row.purchased_at, null)
        await Promise.all([
          A.query('select public.edit_shopping_item($1,$2,$3,$4)', [id, 'Oat milk', 2, 'l']),
          B.query('select public.set_item_purchased($1,true)', [id]),
        ])
        row = (await A.query('select * from public.shopping_items where id=$1', [id])).rows[0]
        assert.equal(row.quantity, '2')
        assert.equal(row.name, 'Oat milk')
        assert.equal(row.is_purchased, true)
        await A.query('select public.update_shopping_list($1,$2,$3)', [
          listId,
          'Archived',
          'archived',
        ])
        await assert.rejects(B.query('select public.set_item_purchased($1,false)', [id]), {
          code: '42501',
        })
        await A.query('select public.update_shopping_list($1,$2,$3)', [
          listId,
          'Shopping',
          'active',
        ])
        await Promise.all([
          A.query('select public.update_shopping_list($1,$2,null)', [listId, 'Renamed']),
          B.query('select public.update_shopping_list($1,null,$2)', [listId, 'archived']),
        ])
        const patched = (
          await A.query('select title, status from public.shopping_lists where id=$1', [listId])
        ).rows[0]
        assert.deepEqual(patched, { title: 'Renamed', status: 'archived' })
        await A.query('select public.update_shopping_list($1,null,$2)', [listId, 'active'])
        await B.query('select public.delete_shopping_item($1)', [id])
        assert.ok(
          (await A.query('select deleted_at from public.shopping_items where id=$1', [id])).rows[0]
            .deleted_at,
        )
      },
    )
    await t.test(
      'removed member immediately loses data/RPC access, own revocation row stays observable',
      async () => {
        const item = (
          await A.query('select id from public.shopping_items where deleted_at is null limit 1')
        ).rows[0].id
        await A.query('select public.remove_group_member($1,$2)', [groupId, b])
        for (const table of ['groups', 'shopping_lists', 'shopping_items'])
          assert.equal((await B.query(`select * from public.${table}`)).rowCount, 0)
        const own = await B.query('select * from public.group_members')
        assert.equal(own.rowCount, 1)
        assert.ok(own.rows[0].removed_at)
        await assert.rejects(B.query('select public.set_item_purchased($1,true)', [item]), {
          code: '42501',
        })
        await assert.rejects(B.query('select public.group_member_profiles($1)', [groupId]), {
          code: '42501',
        })
        const token = freshToken()
        await A.query('select public.create_group_invite($1,$2)', [groupId, hash(token)])
        await B.query('select public.accept_group_invite($1)', [token])
        await B.query('select public.remove_group_member($1,$2)', [groupId, b])
        assert.equal((await B.query('select * from public.groups')).rowCount, 0)
      },
    )
    await t.test(
      'all tables have RLS, definer functions pin search_path, Realtime publication is scoped',
      async () => {
        const tables = await db.admin.query(
          'select relname, relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname=\'public\' and relkind=\'r\'',
        )
        assert.equal(tables.rowCount, 6)
        assert.ok(tables.rows.every((row) => row.relrowsecurity))
        const functions = await db.admin.query(
          'select proname, proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in (\'public\',\'private\') and prosecdef',
        )
        assert.ok(functions.rows.every((row) => row.proconfig?.includes('search_path=""')))
        const publication = await db.admin.query(
          'select tablename from pg_publication_tables where pubname=\'supabase_realtime\'',
        )
        assert.deepEqual(publication.rows.map((row) => row.tablename).sort(), [
          'group_members',
          'groups',
          'shopping_items',
          'shopping_lists',
        ])
      },
    )
  },
)
