import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'

import { isLocale } from '@/i18n/locales'

import { nextForLocale } from '@/lib/auth/redirect'
import { getUser } from '@/lib/auth/user'
import { isAuthConfigured } from '@/lib/config'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { GoogleLoginButton } from '@/modules/Providers/Google'

import styles from '../page.module.scss'

import type { LoginProps } from '@/types/routes'

export const dynamic = 'force-dynamic'

const Login = async ({ params, searchParams }: LoginProps) => {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  const query = await searchParams
  const next = nextForLocale(query.next, locale)

  if (await getUser()) redirect(next)

  const t = await getTranslations('Auth')
  const { error } = query
  const configured = isAuthConfigured()

  return (
    <Grid
      as="section"
      gap={4}
      my={5}
      p={{ initial: 4, tabS: 5 }}
      border
      radius="large"
      surface="paper"
    >
      <Box
        className={styles.icon}
        aria-hidden="true"
      >
        <ArrowUpRight
          size={16}
          aria-hidden="true"
        />
      </Box>
      <Text
        className={styles.eyebrow}
        size="xs"
        weight={700}
        color="accent"
      >
        {t('eyebrow')}
      </Text>
      <Heading
        as="h1"
        size="title"
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
          size="sm"
          color="error"
          role="alert"
        >
          {t(error === 'configuration' ? 'configuration' : 'oauth')}
        </Text>
      }
      <GoogleLoginButton
        locale={locale}
        configured={configured}
        next={next}
      />
      <Text
        size="sm"
        color="muted"
        align="center"
        mt={3}
      >
        {t('note')}
      </Text>
    </Grid>
  )
}

export default Login
