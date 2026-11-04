import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'

import { validationLimits } from '@/constant/validation'

import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'
import { addItem } from '@/modules/Shopping/action'
import { units } from '@/modules/Shopping/schema'

import styles from './index.module.scss'

import type { QuickAddProps } from '@/types/components'

export const QuickAdd = ({ listId, onSuccess }: QuickAddProps) => {
  const t = useTranslations('Workspace')
  const { execute, pending, error, success } = useMutation()

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
            maxLength={validationLimits.itemName}
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
        <details
          className={styles.options}
          data-quantity-options
        >
          <summary className={styles.summary}>
            <ChevronRight
              className={styles.chevron}
              size={16}
              aria-hidden="true"
            />
            {t('quantityAndUnit')}
          </summary>
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
              max={validationLimits.quantity}
              step="any"
              defaultValue="1"
              required
              readOnly={pending}
            />
            <Select
              label={t('unit')}
              name="unit"
              defaultValue="pcs"
              options={units.map(unit => ({ value: unit, label: t(`units.${unit}`) }))}
              disabled={pending}
            />
          </Grid>
        </details>
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
        {
          success &&
          <Text
            size="sm"
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
