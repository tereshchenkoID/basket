import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'

import { DEFAULT_LOCALE, isLocale } from '@/i18n/locales'

import { getTheme } from '@/lib/theme/server'

import { Container } from '@/components/Container'

import NotFound from './[locale]/not-found'

import './[locale]/layout.scss'

export const metadata: Metadata = {
  title: '404 · Basket',
  robots: { index: false, follow: false },
}

const NotFoundPage = async () => {
  const [
    requestHeaders,
    theme
  ] = await Promise.all([
    headers(),
    getTheme(),
  ])
  const requestedLocale = requestHeaders.get('x-next-intl-locale')
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE
  const messages = (await import(`../messages/${locale}.json`)).default

  return (
    <html
      lang={locale}
      data-theme={theme}
    >
      <body>
        {/* This document has no locale root params; all intl defaults are explicit. */}
        <NextIntlClientProvider
          locale={locale}
          formats={{}}
          now={new Date()}
          timeZone="UTC"
          messages={{ NotFound: messages.NotFound }}
        >
          <Container
            as="main"
            grow
            display="flex"
            align="center"
          >
            <NotFound />
          </Container>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default NotFoundPage
