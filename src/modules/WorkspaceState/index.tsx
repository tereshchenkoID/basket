import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import styles from './index.module.scss'

import type { ActionError } from '@/types/action'
export async function WorkspaceState({ error }: { error: ActionError }) {
  const t = await getTranslations('Workspace')
  return (
    <section className={styles.state} role="alert">
      <h1>{t('unavailableTitle')}</h1>
      <p>{t(`errors.${error}`)}</p>
      <Link href="/dashboard">{t('backDashboard')}</Link>
    </section>
  )
}
