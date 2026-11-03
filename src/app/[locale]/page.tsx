import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { isLocale } from '@/i18n/locales'
import { Link } from '@/i18n/navigation'

import { getUser } from '@/lib/auth/user'
import { isAuthConfigured } from '@/lib/config'

import { GoogleLoginButton } from '@/modules/Providers/Google'

import styles from './page.module.scss'

type HomeProps = {
  params: Promise<{
    locale: string
  }>
}

export const dynamic = 'force-dynamic'

const Home = async ({ params }: HomeProps) => {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  const t = await getTranslations('Home')
  const user = await getUser()

  return (
    <section className={styles.hero}>
      <div className={styles['hero-copy']}>
        <p className={styles.eyebrow}>
          <span aria-hidden="true" /> {t('eyebrow')}
        </p>
        <h1>
          {t('title')} <em>{t('accent')}</em>
        </h1>
        <p className={styles.description}>{t('description')}</p>
        <div className={styles['sign-in-area']}>
          {user ? (
            <Link href="/dashboard" className={styles['dashboard-link']}>
              <span>{t('dashboard')}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <>
              <GoogleLoginButton locale={locale} configured={isAuthConfigured()} />
              <p className={styles.note}>{t('note')}</p>
            </>
          )}
        </div>
        <div className={styles['hero-caption']}>
          <span aria-hidden="true">✳</span>
          {t('caption')}
        </div>
      </div>
      <div className={styles['hero-art']}>
        <Image src="/basket.svg" width={560} height={560} alt="" priority />
        <div className={styles['art-caption']}>
          <span aria-hidden="true">01 /</span> {t('artCaption')}
        </div>
      </div>
    </section>
  )
}

export default Home
