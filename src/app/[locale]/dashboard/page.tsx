import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { Avatar } from '@/modules/Avatar'
import { getGroups } from '@/modules/Groups/query'
import { LogoutButton } from '@/modules/Providers/Logout'
import { WorkspaceState } from '@/modules/WorkspaceState'

import DashboardView from './_view'

import styles from '../page.module.scss'

type DashboardProps = {
  params: Promise<{
    locale: string
  }>
}

export const dynamic = 'force-dynamic'

const Dashboard = async ({ params }: DashboardProps) => {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  const user = await getUser()

  if (!user) redirect(`/${locale}/login`)

  const t = await getTranslations('Dashboard')
  const value: unknown = user.user_metadata.full_name ?? user.user_metadata.name
  const name = typeof value === 'string' && value.trim() ? value : t('friend')
  const result = await getGroups()

  return (
    <section className={styles.dashboard}>
      <div className={styles['dashboard-header']}>
        <div>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h1>{t('greeting', { name })}</h1>
          <div className={styles.profile}>
            <Avatar name={name} url={user.user_metadata.avatar_url} />
            <p>{user.email}</p>
          </div>
        </div>
        <LogoutButton locale={locale} />
      </div>
      {result.ok ? (
        <DashboardView groups={result.data} userId={user.id} locale={locale} />
      ) : (
        <WorkspaceState error={result.error} />
      )}
    </section>
  )
}

export default Dashboard
