import EmbeddedPostgres from 'embedded-postgres'
import { randomBytes } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Client } from 'pg'

export async function testDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'basket-postgres-'))
  const port = Number(process.env.BASKET_TEST_PG_PORT ?? 55439)
  const cluster = new EmbeddedPostgres({
    databaseDir: join(directory, 'data'),
    user: 'postgres',
    password: randomBytes(24).toString('hex'),
    port,
    persistent: true,
    autoRehydrateSymlinks: true,
    postgresFlags: [
      '-c',
      'listen_addresses=127.0.0.1',
      '-c',
      'wal_level=logical',
      '-c',
      'log_statement=none',
    ],
    onLog: () => {},
    onError: () => {},
  })
  const clients: Client[] = []
  try {
    await cluster.initialise()
    await cluster.start()
    const admin = cluster.getPgClient()
    await admin.connect()
    clients.push(admin)
    // Supabase's JWT adapter only: all tables, RLS, functions, locks and transactions
    // under test run on a real PostgreSQL process, never a mocked SQL engine.
    await admin.query(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key, raw_user_meta_data jsonb not null default '{}');
      create function auth.uid() returns uuid language sql stable as
        $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
      grant usage on schema public, auth to authenticated, anon;
      grant execute on function auth.uid() to authenticated, anon;
      create publication supabase_realtime;
    `)
    return {
      admin,
      migrate: async () => {
        await admin.query(
          await readFile(
            new URL(
              '../../supabase/migrations/20261103000100_family_shopping.sql',
              import.meta.url,
            ),
            'utf8',
          ),
        )
      },
      asUser: async (id?: string) => {
        const client = cluster.getPgClient()
        await client.connect()
        clients.push(client)
        await client.query(id ? 'set role authenticated' : 'set role anon')
        if (id) await client.query('select set_config(\'request.jwt.claim.sub\', $1, false)', [id])
        return client
      },
      close: async () => {
        await Promise.all(clients.map((client) => client.end()))
        await cluster.stop()
        await rm(directory, { recursive: true, force: true })
      },
    }
  } catch (error) {
    await Promise.all(clients.map((client) => client.end()))
    await cluster.stop().catch(() => {})
    await rm(directory, { recursive: true, force: true })
    throw error
  }
}
