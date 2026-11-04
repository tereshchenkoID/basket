import { useTranslations } from 'next-intl'

import { Text } from '@/components/Text'

import type { ConnectionProps } from './types'

import styles from './index.module.scss'

export const Connection = ({ status }: ConnectionProps) => {
  const t = useTranslations('Workspace')

  return (
    <Text
      className={styles.block}
      size={2}
      color={status === 'live' ? 'accent' : status === 'offline' ? 'error' : 'muted'}
      role="status"
    >
      {t(`connection.${status}`)}
    </Text>
  )
}
