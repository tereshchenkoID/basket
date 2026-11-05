'use client'

import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

import type { Locale } from '@/i18n/locales'
import { isLocale, LOCALES } from '@/i18n/locales'
import { usePathname, useRouter } from '@/i18n/navigation'

import { NAVIGATION } from '@/constant/navigation'

import { nextForLocale } from '@/lib/auth/redirect'

import { Select } from '@/components/Select'

const LABELS = { en: 'English', ro: 'Română', ru: 'Русский', uk: 'Українська' }

export const Languages = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next')
  const t = useTranslations('Workspace')

  const handleChange = (value: Locale) => {
    const query = Object.fromEntries(search.entries())

    if (pathname === NAVIGATION.login.url && next) query.next = nextForLocale(next, value)

    router.replace({ pathname, query }, { locale: value })
  }

  return (
    <Select
      ariaLabel={t('language')}
      value={isLocale(locale) ? locale : 'en'}
      options={LOCALES.map(value => ({ value, label: LABELS[value], shortLabel: value.toUpperCase() }))}
      onChange={handleChange}
    />
  )
}
