import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'

import type { StoreProps } from './types'

export const Store = ({ stores, value, disabled }: StoreProps) => {
  const t = useTranslations('Receipts')
  const [selected, setSelected] = useState(value ?? 'none')
  const handleChange = (next: string) => setSelected(next)

  return (
    <Grid gap={2}>
      <Select
        name="store"
        label={t('store')}
        value={selected}
        onChange={handleChange}
        disabled={disabled}
        options={[
          { value: 'none', label: t('noStore') },
          ...stores.map(store => ({ value: store.id, label: store.name })),
          { value: 'other', label: t('otherStore') },
        ]}
      />
      {
        selected === 'other' &&
        <Input
          label={t('storeName')}
          name="storeName"
          required
          maxLength={120}
          disabled={disabled}
        />
      }
    </Grid>
  )
}
