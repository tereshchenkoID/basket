import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'

import { isLocale } from '@/i18n/locales'

import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

import '@/scss/globals.scss'
import styles from './page.module.scss'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'Common' })
  return {
    referrer: 'no-referrer',
    title: { default: t('brand'), template: `%s · ${t('brand')}` },
    description: t('description'),
  }
}
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)

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
