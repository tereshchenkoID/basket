'use server'

import { getTranslations } from 'next-intl/server'

import { mutate } from '@/lib/supabase/mutation'

import * as repository from './repository'
import {
  CREATE_GROUP_SCHEMA, GROUP_LIFECYCLE_SCHEMA, REMOVE_MEMBER_SCHEMA, RENAME_GROUP_SCHEMA
} from './schema'

export async function createGroup(input: unknown) {
  return mutate(CREATE_GROUP_SCHEMA, input, async (client, value) => {
    const t = await getTranslations({ locale: value.locale, namespace: 'Workspace' })

    return repository.createGroup(client, { ...value, listTitle: t('defaultList') })
  })
}

export async function renameGroup(input: unknown) {
  return mutate(RENAME_GROUP_SCHEMA, input, repository.renameGroup)
}

export async function removeMember(input: unknown) {
  return mutate(REMOVE_MEMBER_SCHEMA, input, repository.removeMember)
}

export async function deleteGroup(input: unknown) {
  return mutate(GROUP_LIFECYCLE_SCHEMA, input, repository.deleteGroup)
}

export async function restoreGroup(input: unknown) {
  return mutate(GROUP_LIFECYCLE_SCHEMA, input, repository.restoreGroup)
}
