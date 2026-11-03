import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { isLocale } from '@/i18n/locales'

import { nextForLocale } from '@/lib/auth/redirect'
import { getUser } from '@/lib/auth/user'
import { isAuthConfigured } from '@/lib/config'

import { GoogleLoginButton } from '@/modules/Providers/Google'

import styles from '../page.module.scss'

type LoginProps = {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    error?: string | string[]
    next?: string | string[]
  }>
}

export const dynamic = 'force-dynamic'

const Login = async ({ params, searchParams }: LoginProps) => {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  const query = await searchParams
  const next = nextForLocale(query.next, locale)

  if (await getUser()) redirect(next)

  const t = await getTranslations('Auth')
  const { error } = query
  const configured = isAuthConfigured()

  return (
    <section className={styles['center-card']}>
      <div className={styles['card-icon']} aria-hidden="true">
        ↗
      </div>
      <p className={styles.eyebrow}>{t('eyebrow')}</p>
      <h1>{t('title')}</h1>
      <p className={styles.description}>{t('description')}</p>
      {error && configured && (
        <p className={styles['error-message']} role="alert">
          {t(error === 'configuration' ? 'configuration' : 'oauth')}
        </p>
      )}
      <GoogleLoginButton locale={locale} configured={configured} next={next} />
      <p className={styles.note}>{t('note')}</p>
    </section>
  )
}

export default Login
