import { useTranslations } from 'next-intl'
import { ArrowLeft, CircleAlert, ShoppingBasket } from 'lucide-react'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

import styles from './index.module.scss'

import type { EmptyProps } from '@/types/components'

export const Empty = ({
  error,
  title,
  description,
  heading = 'h2',
  children,
}: EmptyProps) => {
  const t = useTranslations('Workspace')
  const key = typeof error === 'string' && t.has(`errors.${error}`) ? error : 'unavailable'
  const Icon = error ? CircleAlert : ShoppingBasket

  return (
    <Grid
      as="section"
      gap={3}
      my={5}
      p={{ initial: 4, tabS: 5 }}
      border
      radius="large"
      surface="paper"
      className={styles.block}
      role={error ? 'alert' : undefined}
    >
      <Box className={styles.icon}>
        <Icon
          size={28}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </Box>
      <Heading
        as={heading}
        size="xl"
      >
        {title ?? t(error ? 'unavailableTitle' : 'emptyTitle')}
      </Heading>
      <Text color="muted">{description ?? t(error ? `errors.${key}` : 'emptyDescription')}</Text>
      {
        children || error &&
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
              href="/dashboard"
              variant="secondary"
            >
              <ArrowLeft
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
