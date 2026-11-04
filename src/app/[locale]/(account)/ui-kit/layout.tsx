import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Text } from '@/components/Text'

import { Navigation } from './_view/navigation'
import type { UIKitLayoutProps } from './types'

import styles from './_view/index.module.scss'

export const metadata: Metadata = {
  title: 'Development UI kit',
  robots: { index: false, follow: false },
}

const UIKitLayout = ({ children }: UIKitLayoutProps) => {
  if (process.env.NODE_ENV !== 'development') notFound()

  return (
    <Grid
      full
      gap={4}
      py={4}
    >
      <Text
        size={2}
        color="muted"
      >
        Basket / Development / UI kit
      </Text>
      <Grid
        columns={{ initial: 1, tabS: '220px 1fr' }}
        align="start"
        gap={4}
      >
        <Navigation />
        <Box className={styles.content}>{children}</Box>
      </Grid>
    </Grid>
  )
}

export default UIKitLayout
