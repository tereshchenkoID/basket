import type { SubmitEvent } from 'react'
import { useTranslations } from 'next-intl'

import { VALIDATION_LIMITS } from '@/constant/validation'

import { createList, updateList } from '@/lib/shopping/action'
import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'
import { Store } from '@/modules/Store'

import type { ListFormProps } from './types'

export const ListForm = ({ groupId, list, onSuccess, stores = [], storesAvailable = false }: ListFormProps) => {
  const t = useTranslations('Workspace')
  const { execute, pending, error } = useMutation(t(list ? 'listUpdated' : 'listCreated'))

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = form.get('name')
    const selected = form.get('store')
    const storeId = storesAvailable ? selected === 'none' || selected === 'other' ? null : selected : undefined
    const storeName = selected === 'other' ? form.get('storeName') : undefined

    if (list) {
      const result = await execute(() => updateList({ listId: list.id, title, storeId, storeName }))

      if (result) onSuccess(list.id)
    } else {
      const result = await execute(id => createList({ id, groupId, title, storeId, storeName }))

      if (result) onSuccess(result.data)
    }
  }

  return (
    <Grid
      as="form"
      gap={3}
      onSubmit={handleSubmit}
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
          maxLength={VALIDATION_LIMITS.listTitle}
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
        storesAvailable &&
        <Store
          stores={stores}
          value={list?.store_id}
          disabled={pending}
        />
      }
      {
        error &&
        <Text
          size={2}
          color="error"
          role="alert"
        >
          {t(`errors.${error}`)}
        </Text>
      }
    </Grid>
  )
}
