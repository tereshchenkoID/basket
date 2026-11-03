import { getTranslations } from 'next-intl/server'

import styles from './index.module.scss'

export async function WorkspaceLoading() {
  const t = await getTranslations('Workspace')
  return (
    <section className={styles.loading} role="status">
      <p>{t('loading')}</p>
    </section>
  )
}
