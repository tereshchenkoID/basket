'use client'
import { useActionState } from 'react'
import { useTranslations } from 'next-intl'

import type { Locale } from '@/i18n/locales'

import { logout } from '@/app/actions/auth'

import styles from './index.module.scss'
export function LogoutButton({ locale }: { locale: Locale }) {
  const t = useTranslations('Auth')
  const [state, action, pending] = useActionState(logout.bind(null, locale), { error: false })
  return (
    <form action={action}>
      <button className={styles.logout} disabled={pending} aria-busy={pending}>
        {pending ? t('loggingOut') : t('logout')}
      </button>
      {state.error && (
        <p className={styles.error} role="alert">
          {t('logoutError')}
        </p>
      )}
    </form>
  )
}
