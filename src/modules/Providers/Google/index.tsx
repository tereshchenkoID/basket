'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { callbackUrl } from '@/lib/auth/redirect'
import { getSiteUrl } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'

import { Action } from '@/components/Action'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'

import type { GoogleProps } from './types'

import styles from './index.module.scss'

export const Google = ({ locale, configured, next }: GoogleProps) => {
  const t = useTranslations('Workspace.auth')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  const handleLogin = async () => {
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
      <Action
        variant="secondary"
        className={styles.button}
        type="button"
        onClick={handleLogin}
        disabled={pending || !configured}
        aria-busy={pending}
      >
        <Icon
          name="google"
          size={20}
          aria-hidden="true"
        />
        <Text as="span">{pending ? t('loading') : t('google')}</Text>
        <Icon
          name="arrow-up-right"
          size={18}
          aria-hidden="true"
        />
      </Action>
      <div
        aria-live="polite"
        role={error ? 'alert' : undefined}
      >
        {
          !configured &&
          <Text
            size={2}
            color="error"
            mt={3}
          >
            {t('configuration')}
          </Text>
        }
        {
          error &&
          <Text
            size={2}
            color="error"
            mt={3}
          >
            {t('oauth')}
          </Text>
        }
        {
          pending &&
          <Text
            as="span"
            className={styles.hidden}
          >
            {t('loading')}
          </Text>
        }
      </div>
    </div>
  )
}
