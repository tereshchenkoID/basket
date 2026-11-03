'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import type { Locale } from '@/i18n/locales'

import { callbackUrl } from '@/lib/auth/redirect'
import { getSiteUrl } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'

import styles from './index.module.scss'

type GoogleLoginButtonProps = {
  locale: Locale
  configured: boolean
  next?: string
}

export const GoogleLoginButton = ({ locale, configured, next }: GoogleLoginButtonProps) => {
  const t = useTranslations('Auth')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  const signIn = async () => {
    setPending(true)
    setError(false)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl(getSiteUrl(), locale, next),
        },
      })

      if (error) throw error
    } catch {
      setError(true)
      setPending(false)
    }
  }

  return (
    <div className={styles.auth}>
      <button
        className={styles['google-button']}
        type="button"
        onClick={signIn}
        disabled={pending || !configured}
        aria-busy={pending}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.08v2.6A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.42 13.92a6 6 0 0 1 0-3.84v-2.6H3.08a10 10 0 0 0 0 9.04l3.34-2.6Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.92 5.48l3.34 2.6A5.99 5.99 0 0 1 12 5.96Z"
          />
        </svg>
        <span>{pending ? t('loading') : t('google')}</span>
        <span aria-hidden="true">↗</span>
      </button>
      <div aria-live="polite" role={error ? 'alert' : undefined}>
        {!configured && <p className={styles.error}>{t('configuration')}</p>}
        {error && <p className={styles.error}>{t('oauth')}</p>}
        {pending && <span className={styles['screen-reader']}>{t('loading')}</span>}
      </div>
    </div>
  )
}
