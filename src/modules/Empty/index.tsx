import { useTranslations } from 'next-intl'

import { ROUTES_USER } from '@/constant/navigation'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'

import type { EmptyProps } from './types'

import styles from './index.module.scss'

export const Empty = ({
  error,
  title,
  description,
  heading = 'h2',
  children,
}: EmptyProps) => {
  const t = useTranslations('Workspace')
  const key = typeof error === 'string' && t.has(`errors.${error}`) ? error : 'unavailable'
  const message = description ?? t(error ? `errors.${key}` : 'emptyDescription')

  return (
    <Grid
      as="section"
      gap={3}
      my={5}
      p={{ initial: 4, tabS: 5 }}
      border
      radius="lg"
      surface="default"
      className={styles.block}
      role={error ? 'alert' : undefined}
    >
      <Box className={styles.icon}>
        <Icon
          name={error ? 'circle-alert' : 'shopping-basket'}
          size={28}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </Box>
      <Heading
        as={heading}
        size={5}
      >
        {title ?? t(error ? 'unavailableTitle' : 'emptyTitle')}
      </Heading>
      {
        message &&
        <Text color="muted">{message}</Text>
      }
      {
        (children || error) &&
        <Box
          display="flex"
          justify="center"
          align="center"
          wrap="wrap"
          gap={2}
          mt={2}
        >
          {children ?? (
            <Action
              href={ROUTES_USER.dashboard.url}
              variant="secondary"
            >
              <Icon
                name="arrow-left"
                size={16}
                aria-hidden="true"
              />
              {t('backDashboard')}
            </Action>
          )}
        </Box>
      }
    </Grid>
  )
}
