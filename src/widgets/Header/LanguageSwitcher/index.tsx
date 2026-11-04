'use client'

import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

import { isLocale, locales } from '@/i18n/locales'
import { usePathname, useRouter } from '@/i18n/navigation'

import { nextForLocale } from '@/lib/auth/redirect'

import { Select } from '@/components/Select'

const labels = { en: 'English', ro: 'Română', ru: 'Русский', uk: 'Українська' }

export const LanguageSwitcher = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next')
  const t = useTranslations('Common')

  return (
    <Select
      ariaLabel={t('language')}
      value={isLocale(locale) ? locale : 'en'}
      options={locales.map(value => ({ value, label: labels[value], shortLabel: value.toUpperCase() }))}
      onChange={value => router.replace(
        pathname === '/login' && next
          ? { pathname, query: { next: nextForLocale(next, value) } }
          : pathname,
        { locale: value },
      )}
    />
  )
}
