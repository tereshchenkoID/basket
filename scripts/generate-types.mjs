import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const result = spawnSync(
  process.execPath,
  ['node_modules/supabase/dist/supabase.js', 'gen', 'types', '--remote', '--schema', 'public'],
  {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
  },
)

if (result.error || result.status !== 0) {
  console.error('Type generation failed; existing types were preserved.')
  process.exit(1)
}

writeFileSync('src/types/database.generated.ts', result.stdout)
console.log(
  'Generated src/types/database.generated.ts. Review it against src/types/database.ts before replacing the application contract.',
)
