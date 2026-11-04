import { useTranslations } from 'next-intl'

import { validationLimits } from '@/constant/validation'

import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'
import { editItem } from '@/modules/Shopping/action'
import { units } from '@/modules/Shopping/schema'

import type { ItemFormProps } from '@/types/components'

export const ItemForm = ({ item, onSuccess }: ItemFormProps) => {
  const t = useTranslations('Workspace')
  const { execute, pending, error } = useMutation()

  return (
    <Grid
      as="form"
      gap={3}
      onSubmit={async event => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const result = await execute(() => editItem({
          itemId: item.id,
          name: form.get('name'),
          quantity: Number(form.get('quantity')),
          unit: form.get('unit'),
        }))

        if (result) onSuccess()
      }}
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
          maxLength={validationLimits.itemName}
          disabled={pending}
        />
        <Action
          type="submit"
          isLoading={pending}
        >
          {t('save')}
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
          max={validationLimits.quantity}
          defaultValue={item.quantity}
          required
          disabled={pending}
        />
        <Select
          label={t('unit')}
          name="unit"
          defaultValue={item.unit}
          options={units.map(unit => ({ value: unit, label: t(`units.${unit}`) }))}
          disabled={pending}
        />
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
