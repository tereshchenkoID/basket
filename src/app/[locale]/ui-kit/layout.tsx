import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { NAVIGATION } from '@/constant/navigation'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Breadcrumbs } from '@/modules/Breadcrumbs'

import { Navigation } from './_view/navigation'
import type { UIKitLayoutProps } from './types'

import styles from './_view/index.module.scss'

export const metadata: Metadata = {
  title: 'Development UI kit',
  robots: { index: false, follow: false },
}

const UIKitLayout = ({ children }: UIKitLayoutProps) => {
  const t = useTranslations('Workspace')

  if (process.env.NODE_ENV !== 'development') notFound()

  return (
    <Grid
      full
      gap={4}
      py={4}
    >
      <Breadcrumbs
        items={[
          { label: t(NAVIGATION.home.text), href: NAVIGATION.home.url },
          { label: 'UI kit' },
        ]}
      />
      <Grid
        columns={{ initial: 1, tabS: '13rem 1fr' }}
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
