import { useTranslations } from 'next-intl'

import Icon from '@/components/Icon'
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
      <Icon
        name="loader-circle"
        className={styles.icon}
        size={28}
        aria-hidden="true"
      />
      <Text
        size={2}
        color="muted"
      >
        {t('loading')}
      </Text>
    </section>
  )
}
