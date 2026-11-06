import type { ChangeEvent } from 'react'
import { memo } from 'react'
import { useTranslations } from 'next-intl'

import { RECEIPT_UNITS } from '@/constant/receipts'

import type { ReceiptItem } from '@/lib/receipts/types'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Checkbox } from '@/components/Checkbox'
import { Grid } from '@/components/Grid'
import Icon from '@/components/Icon'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'

import type { ItemProps } from './types'

export const Item = memo(({ item, index, count, disabled, onChange, onMove, onRemove }: ItemProps) => {
  const t = useTranslations('Receipts')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.currentTarget.name as keyof ReceiptItem
    onChange(item.key, { ...item, [field]: event.currentTarget.value })
  }

  const handleUnit = (unit: string) => onChange(item.key, { ...item, unit })

  const handleReviewed = (event: ChangeEvent<HTMLInputElement>) => onChange(item.key, { ...item, needs_review: !event.currentTarget.checked })

  const handleMove = (direction: number) => onMove(item.key, direction)

  const handleRemove = () => onRemove(item.key)

  return (
    <Grid
      as="li"
      gap={2}
      p={3}
      border
      radius="sm"
      surface="default"
    >
      <Box
        display="flex"
        align="center"
        justify="between"
        gap={2}
        wrap="wrap"
      >
        <Text weight="semibold">{t('itemNumber', { number: index + 1 })}</Text>
        <Box
          display="flex"
          gap={2}
          wrap="wrap"
        >
          <Action
            variant="secondary"
            disabled={disabled || index === 0}
            onClick={() => handleMove(-1)}
            aria-label={t('moveUp')}
          >
            <Icon
              name="arrow-up"
              size={18}
              aria-hidden="true"
            />
          </Action>
          <Action
            variant="secondary"
            disabled={disabled || index === count - 1}
            onClick={() => handleMove(1)}
            aria-label={t('moveDown')}
          >
            <Icon
              name="arrow-down"
              size={18}
              aria-hidden="true"
            />
          </Action>
          <Action
            variant="danger"
            disabled={disabled}
            onClick={handleRemove}
          >
            {t('remove')}
          </Action>
        </Box>
      </Box>
      <Input
        label={t('name')}
        name="display_name"
        value={item.display_name}
        title={item.original_name ? t('original', { name: item.original_name }) : undefined}
        maxLength={240}
        disabled={disabled}
        onChange={handleChange}
      />
      <Grid
        columns={{ initial: 1, mobM: 2, tabM: 5 }}
        gap={2}
      >
        <Input
          label={t('quantity')}
          name="quantity"
          value={item.quantity}
          inputMode="decimal"
          disabled={disabled}
          onChange={handleChange}
        />
        <Select
          label={t('unit')}
          value={item.unit}
          disabled={disabled}
          onChange={handleUnit}
          options={[{ value: '', label: t('unknown') }, ...RECEIPT_UNITS.map(value => ({ value, label: t(`units.${value}`) }))]}
        />
        <Input
          label={t('unitPrice')}
          name="unit_price"
          value={item.unit_price}
          inputMode="decimal"
          disabled={disabled}
          onChange={handleChange}
        />
        <Input
          label={t('lineTotal')}
          name="line_total"
          value={item.line_total}
          inputMode="decimal"
          disabled={disabled}
          onChange={handleChange}
        />
        <Input
          label={t('discount')}
          name="discount_amount"
          value={item.discount_amount}
          inputMode="decimal"
          disabled={disabled}
          onChange={handleChange}
        />
      </Grid>
      <Checkbox
        label={t('reviewed')}
        checked={!item.needs_review}
        disabled={disabled}
        onChange={handleReviewed}
      />
    </Grid>
  )
})
