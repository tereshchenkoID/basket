'use server'

import { getTranslations } from 'next-intl/server'

import { mutate } from '@/lib/supabase/mutation'

import { createGroupSchema, removeMemberSchema, renameGroupSchema } from './schema'

export async function createGroup(input: unknown) {
  return mutate(createGroupSchema, input, async (client, value) => {
    const t = await getTranslations({ locale: value.locale, namespace: 'Workspace' })

    return client.rpc('create_group', {
      p_id: value.id,
      p_name: value.name,
      p_list_title: t('defaultList'),
    })
  })
}

export async function renameGroup(input: unknown) {
  return mutate(renameGroupSchema, input, (client, value) =>
    client.rpc('rename_group', { p_group_id: value.groupId, p_name: value.name }),
  )
}

export async function removeMember(input: unknown) {
  return mutate(removeMemberSchema, input, (client, value) =>
    client.rpc('remove_group_member', { p_group_id: value.groupId, p_member_id: value.memberId }),
  )
}
