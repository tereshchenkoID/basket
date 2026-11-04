import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'

import { getTheme } from '@/lib/theme/server'

import { Container } from '@/components/Container'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { Modals } from '@/widgets/Modals'
import { Toastify } from '@/widgets/Toastify'

import type { LocaleLayoutProps } from './types'

import './layout.scss'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Workspace')

  return {
    referrer: 'no-referrer',
    title: { default: t('brand'), template: `%s · ${t('brand')}` },
    description: t('description'),
  }
}

const LocaleLayout = async ({ children }: LocaleLayoutProps) => {
  const [
    locale,
    theme,
    messages
  ] = await Promise.all([
    getLocale(),
    getTheme(),
    getMessages(),
  ])

  return (
    <html
      lang={locale}
      data-theme={theme}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header theme={theme} />
          <Container
            as="main"
            id="main"
            grow
            display="flex"
            align="center"
          >
            {children}
          </Container>
          <Footer />
          <Modals />
          <Toastify />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default LocaleLayout
