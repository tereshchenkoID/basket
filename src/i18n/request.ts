import { notFound } from 'next/navigation'
import * as rootParams from 'next/root-params'
import { getRequestConfig } from 'next-intl/server'

import { isLocale } from './locales'

export default getRequestConfig(async ({ locale: localeOverride }) => {
  const locale = localeOverride ?? await rootParams.locale()

  if (!isLocale(locale)) notFound()

  return { locale, messages: (await import(`../messages/${locale}.json`)).default }
})
