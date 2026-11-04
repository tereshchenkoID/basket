import { useTranslations } from 'next-intl'

import { validationLimits } from '@/constant/validation'

import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'

import { createList, updateList } from '../action'

import type { ListFormProps } from '@/types/components'

export const ListForm = ({ groupId, list, onSuccess }: ListFormProps) => {
  const t = useTranslations('Workspace')
  const { execute, pending, error } = useMutation()

  return (
    <Grid
      as="form"
      gap={3}
      onSubmit={async event => {
        event.preventDefault()
        const title = new FormData(event.currentTarget).get('name')

        if (list) {
          const result = await execute(() => updateList({ listId: list.id, title }))

          if (result) onSuccess(list.id)
        } else {
          const result = await execute(id => createList({ id, groupId, title }))

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
          label={t('listTitle')}
          name="name"
          required
          maxLength={validationLimits.listTitle}
          placeholder={t('defaultList')}
          defaultValue={list?.title}
          disabled={pending}
        />
        <Action
          type="submit"
          isLoading={pending}
        >
          {t(list ? 'save' : 'createList')}
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
