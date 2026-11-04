import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

import { isLocale } from '@/i18n/locales'

import { getTheme } from '@/lib/theme/server'

import { Box } from '@/components/Box'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

import './layout.scss'
import styles from './layout.module.scss'

import type { LocaleLayoutProps } from '@/types/routes'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
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

  const theme = await getTheme()
  const messages = await getMessages()
  const t = await getTranslations('Common')

  return (
    <html
      lang={locale}
      data-theme={theme}
    >
      <body className={styles.body}>
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main"
            className={styles.skip}
          >
            {t('skip')}
          </a>
          <Header theme={theme} />
          <Box
            as="main"
            id="main"
            container
            grow
            display="flex"
            align="center"
          >
            {children}
          </Box>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default LocaleLayout
