'use client'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

import { locales } from '@/i18n/locales'
import { Link, usePathname } from '@/i18n/navigation'

import { nextForLocale } from '@/lib/auth/redirect'

import styles from './index.module.scss'
const labels = { en: 'English', ro: 'Română', ru: 'Русский', uk: 'Українська' }
export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const search = useSearchParams()
  const next = search.get('next')
  const t = useTranslations('Common')
  return (
    <nav className={styles.languages} aria-label={t('language')}>
      {locales.map((value) => (
        <Link
          key={value}
          href={
            pathname === '/login' && next
              ? { pathname, query: { next: nextForLocale(next, value) } }
              : pathname
          }
          locale={value}
          aria-current={locale === value ? 'true' : undefined}
          aria-label={labels[value]}
          lang={value}
        >
          {value.toUpperCase()}
        </Link>
      ))}
    </nav>
  )
}
