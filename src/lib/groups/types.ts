import type { z } from 'zod'

import type {
  CREATE_GROUP_SCHEMA, GROUP_LIFECYCLE_SCHEMA, REMOVE_MEMBER_SCHEMA, RENAME_GROUP_SCHEMA
} from './schema'

export type CreateGroupRecord = Pick<z.output<typeof CREATE_GROUP_SCHEMA>, 'id' | 'name'> & {
  listTitle: string
}

export type RenameGroupInput = z.output<typeof RENAME_GROUP_SCHEMA>

export type RemoveMemberInput = z.output<typeof REMOVE_MEMBER_SCHEMA>

export type GroupLifecycleInput = z.output<typeof GROUP_LIFECYCLE_SCHEMA>
