'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Monitor, Moon, Sun } from 'lucide-react'

import { themes } from '@/constant/theme'

import { saveTheme } from '@/lib/theme/client'

import { Select } from '@/components/Select'

import type { ThemeSwitcherProps } from '@/types/components'

const icons = { light: Sun, dark: Moon, system: Monitor }

export const ThemeSwitcher = ({ initialTheme }: ThemeSwitcherProps) => {
  const t = useTranslations('Common')
  const [theme, setTheme] = useState(initialTheme)

  return (
    <Select
      label={t('theme.label')}
      value={theme}
      options={themes.map(value => ({ value, label: t(`theme.${value}`), icon: icons[value] }))}
      onChange={value => {
        saveTheme(value)
        setTheme(value)
      }}
    />
  )
}
