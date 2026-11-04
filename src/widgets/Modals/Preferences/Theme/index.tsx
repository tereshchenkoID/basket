'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { THEMES } from '@/constant/theme'

import { saveTheme } from '@/lib/theme/client'

import { Select } from '@/components/Select'

import type { ThemeProps } from './types'

const ICONS = { light: 'sun', dark: 'moon', system: 'monitor' }

export const Theme = ({ initialTheme }: ThemeProps) => {
  const t = useTranslations('Workspace')
  const [theme, setTheme] = useState(initialTheme)

  return (
    <Select
      label={t('theme.label')}
      value={theme}
      options={THEMES.map(value => ({ value, label: t(`theme.${value}`), icon: ICONS[value] }))}
      onChange={value => {
        saveTheme(value)
        setTheme(value)
      }}
    />
  )
}
