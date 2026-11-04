import { useTranslations } from 'next-intl'
import { LoaderCircle } from 'lucide-react'

import { Text } from '@/components/Text'

import styles from './index.module.scss'

export const Loading = () => {
  const t = useTranslations('Workspace')

  return (
    <section
      className={styles.block}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className={styles.icon}
        size={28}
        aria-hidden="true"
      />
      <Text
        size="sm"
        color="muted"
      >
        {t('loading')}
      </Text>
    </section>
  )
}
