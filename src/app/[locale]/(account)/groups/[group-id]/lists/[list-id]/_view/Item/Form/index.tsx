import { useTranslations } from 'next-intl'

import { VALIDATION_LIMITS } from '@/constant/validation'

import { editItem } from '@/lib/shopping/action'
import { UNITS } from '@/lib/shopping/schema'
import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'

import type { FormProps } from './types'

export const Form = ({ item, onSuccess }: FormProps) => {
  const t = useTranslations('List')
  const workspace = useTranslations('Workspace')
  const { execute, pending, error } = useMutation(t('itemUpdated'))

  const handleSubmit = async (event: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const result = await execute(() => editItem({
      itemId: item.id,
      name: form.get('name'),
      quantity: Number(form.get('quantity')),
      unit: form.get('unit'),
    }))

    if (result) onSuccess()
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
          label={t('itemName')}
          name="name"
          defaultValue={item.name}
          required
          maxLength={VALIDATION_LIMITS.itemName}
          disabled={pending}
        />
        <Action
          type="submit"
          isLoading={pending}
        >
          {workspace('save')}
        </Action>
      </Grid>
      <Grid
        columns={2}
        gap={3}
      >
        <Input
          label={t('quantity')}
          name="quantity"
          type="number"
          inputMode="decimal"
          min="0.001"
          step="any"
          max={VALIDATION_LIMITS.quantity}
          defaultValue={item.quantity}
          required
          disabled={pending}
        />
        <Select
          label={t('unit')}
          name="unit"
          defaultValue={item.unit}
          options={UNITS.map(unit => ({ value: unit, label: t(`units.${unit}`) }))}
          disabled={pending}
        />
      </Grid>
      {
        error &&
        <Text
          size={2}
          color="error"
          role="alert"
        >
          {workspace(`errors.${error}`)}
        </Text>
      }
    </Grid>
  )
}
