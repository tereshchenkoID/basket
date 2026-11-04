import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { Box } from '@/components/Box'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { Empty } from '@/modules/Empty'
import { getGroups } from '@/modules/Groups/query'

import DashboardView from './_view'

import styles from '../page.module.scss'

import type { LocalePageProps } from '@/types/routes'

export const dynamic = 'force-dynamic'

const Dashboard = async ({ params }: LocalePageProps) => {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  const user = await getUser()

  if (!user) redirect(`/${locale}/login`)

  const t = await getTranslations('Dashboard')
  const common = await getTranslations('Common')
  const result = await getGroups()

  return (
    <Box
      as="section"
      full
      py={4}
    >
      <Text
        className={styles.eyebrow}
        size="xs"
        weight={700}
        color="accent"
      >
        {t('eyebrow')}
      </Text>
      <Heading
        as="h1"
        size="title"
      >{common('dashboard')}</Heading>
      {
        result.ok
          ?
          <DashboardView
            groups={result.data}
            userId={user.id}
            locale={locale}
          />
          :
          <Empty
            heading="h1"
            error={result.error}
          />
      }
    </Box>
  )
}

export default Dashboard
