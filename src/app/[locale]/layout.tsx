import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

import { isLocale } from '@/i18n/locales'

import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

import './layout.scss'
import styles from './page.module.scss'

type LocaleLayoutProps = {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export const generateMetadata = async ({ params }: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> => {
  const { locale } = await params

  if (!isLocale(locale)) return {}

  const t = await getTranslations({ locale, namespace: 'Common' })

  return {
    referrer: 'no-referrer',
    title: { default: t('brand'), template: `%s · ${t('brand')}` },
    description: t('description'),
  }
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  const messages = await getMessages()
  const t = await getTranslations('Common')

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className={styles.shell}>
            <a href="#main" className={styles['skip-link']}>
              {t('skip')}
            </a>
            <Header />
            <main id="main" className={styles.main}>
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default LocaleLayout
