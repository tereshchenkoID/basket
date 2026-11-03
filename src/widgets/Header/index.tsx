import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { LanguageSwitcher } from '@/modules/Languages'

import styles from './index.module.scss'
export async function Header() {
  const t = await getTranslations('Common')
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <svg width="29" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="m7 12 6-8m12 8-6-8M4 12h24l-3 15H7L4 12Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 17v5m8-5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {t('brand')}
        <span className={styles['brand-dot']}>.</span>
      </Link>
      <Suspense>
        <LanguageSwitcher />
      </Suspense>
    </header>
  )
}
