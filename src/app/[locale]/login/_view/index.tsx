'use client'

import { useTranslations } from 'next-intl'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'
import { Google } from '@/modules/Providers/Google'

import type { LoginViewProps } from './types'

import styles from './index.module.scss'

const Section = ({ locale, next, error, configured }: LoginViewProps) => {
  const t = useTranslations('Login')
  const auth = useTranslations('Workspace.auth')

  return (
    <Grid
      as="section"
      gap={4}
      my={5}
      p={{ initial: 4, tabS: 5 }}
      border
      radius="lg"
      surface="default"
    >
      <Box
        className={styles.icon}
        aria-hidden="true"
      >
        <Icon
          name="arrow-up-right"
          size={16}
          aria-hidden="true"
        />
      </Box>
      <Text
        className={styles.eyebrow}
        transform="uppercase"
        size={1}
        weight="bold"
        color="accent"
      >
        {t('eyebrow')}
      </Text>
      <Heading
        as="h1"
        size={6}
      >
        {t('title')}
      </Heading>
      <Text
        color="muted"
        my={4}
      >
        {t('description')}
      </Text>
      {
        error && configured &&
        <Text
          size={2}
          color="error"
          role="alert"
        >
          {auth(error === 'configuration' ? 'configuration' : 'oauth')}
        </Text>
      }
      <Google
        locale={locale}
        configured={configured}
        next={next}
      />
      <Text
        size={2}
        color="muted"
        align="center"
        mt={3}
      >
        {t('note')}
      </Text>
    </Grid>
  )
}

export default Section
