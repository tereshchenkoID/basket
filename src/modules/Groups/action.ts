'use server'

import { getTranslations } from 'next-intl/server'

import { mutate } from '@/lib/supabase/mutation'

import * as repository from './repository'
import { createGroupSchema, removeMemberSchema, renameGroupSchema } from './schema'

export async function createGroup(input: unknown) {
  return mutate(createGroupSchema, input, async (client, value) => {
    const t = await getTranslations({ locale: value.locale, namespace: 'Workspace' })

    return repository.createGroup(client, { ...value, listTitle: t('defaultList') })
  })
}

export async function renameGroup(input: unknown) {
  return mutate(renameGroupSchema, input, repository.renameGroup)
}

export async function removeMember(input: unknown) {
  return mutate(removeMemberSchema, input, repository.removeMember)
}
