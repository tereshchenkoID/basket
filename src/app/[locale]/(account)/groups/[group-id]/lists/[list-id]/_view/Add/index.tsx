import { useTranslations } from 'next-intl'

import { VALIDATION_LIMITS } from '@/constant/validation'

import { addItem } from '@/lib/shopping/action'
import { UNITS } from '@/lib/shopping/schema'
import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Dropdown } from '@/components/Dropdown'
import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'

import type { AddProps } from './types'

import styles from './index.module.scss'

export const Add = ({ listId, onSuccess }: AddProps) => {
  const t = useTranslations('List')
  const workspace = useTranslations('Workspace')
  
  const { execute, pending, error, success } = useMutation(t('itemAdded'))

  return (
    <section
      className={styles.block}
      data-shopping-composer
      aria-label={t('addItem')}
    >
      <Grid
        as="form"
        gap={2}
        aria-busy={pending}
        onSubmit={async event => {
          event.preventDefault()
          const form = event.currentTarget
          const values = new FormData(form)
          const result = await execute(id => addItem({
            id,
            listId,
            name: values.get('name'),
            quantity: Number(values.get('quantity')),
            unit: values.get('unit'),
          }))

          if (result) {
            form.reset()
            const input = form.elements.namedItem('name')

            if (input instanceof HTMLInputElement) input.focus({ preventScroll: true })

            onSuccess()
          }
        }}
      >
        <Grid
          columns="1fr auto"
          align="end"
          gap={2}
        >
          <Input
            label={t('addItem')}
            name="name"
            placeholder={t('itemPlaceholder')}
            required
            maxLength={VALIDATION_LIMITS.itemName}
            autoComplete="off"
            enterKeyHint="done"
            readOnly={pending}
          />
          <Action
            type="submit"
            isLoading={pending}
          >
            {t('add')}
          </Action>
        </Grid>
        <Dropdown
          label={<Text
            as="span"
            color="muted"
                 >
                   {t('quantityAndUnit')}
                 </Text>}
          plain
          data-quantity-options
        >
          <Grid
            columns={2}
            gap={3}
            pb={3}
          >
            <Input
              label={t('quantity')}
              name="quantity"
              type="number"
              inputMode="decimal"
              min="0.001"
              max={VALIDATION_LIMITS.quantity}
              step="any"
              defaultValue="1"
              required
              readOnly={pending}
            />
            <Select
              label={t('unit')}
              name="unit"
              defaultValue="pcs"
              options={UNITS.map(unit => ({ value: unit, label: t(`units.${unit}`) }))}
              disabled={pending}
            />
          </Grid>
        </Dropdown>
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
        {
          success &&
          <Text
            size={2}
            color="success"
            role="status"
          >
            {t('itemAdded')}
          </Text>
        }
      </Grid>
    </section>
  )
}
