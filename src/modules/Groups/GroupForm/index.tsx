import { useTranslations } from 'next-intl'

import { validationLimits } from '@/constant/validation'

import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'

import { createGroup, renameGroup } from '../action'

import type { GroupFormProps } from '@/types/components'

export const GroupForm = ({ group, locale, onSuccess }: GroupFormProps) => {
  const t = useTranslations('Workspace')
  const { execute, pending, error } = useMutation()

  return (
    <Grid
      as="form"
      gap={3}
      onSubmit={async event => {
        event.preventDefault()
        const name = new FormData(event.currentTarget).get('name')

        if (group) {
          const result = await execute(() => renameGroup({ groupId: group.id, name }))

          if (result) onSuccess(group.id)
        } else {
          const result = await execute(id => createGroup({ id, name, locale }))

          if (result) onSuccess(result.data)
        }
      }}
      aria-busy={pending}
    >
      <Grid
        columns={{ initial: 1, mobM: '1fr auto' }}
        align="end"
        gap={3}
      >
        <Input
          label={t('groupName')}
          name="name"
          required
          maxLength={validationLimits.groupName}
          autoComplete="off"
          placeholder={t('groupPlaceholder')}
          defaultValue={group?.name}
          disabled={pending}
        />
        <Action
          type="submit"
          isLoading={pending}
        >
          {t(group ? 'renameGroup' : 'createGroup')}
        </Action>
      </Grid>
      {
        error &&
        <Text
          size="sm"
          color="error"
          role="alert"
        >
          {t(`errors.${error}`)}
        </Text>
      }
    </Grid>
  )
}
