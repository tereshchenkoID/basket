import { getTranslations } from 'next-intl/server'

import styles from './index.module.scss'

export const Footer = async () => {
  const t = await getTranslations('Common')

  return (
    <footer className={styles.footer}>
      <span>{t('footer')}</span>
      <span>{t('smallSteps')}</span>
    </footer>
  )
}
