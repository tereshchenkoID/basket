import { Suspense } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'

import { DEFAULT_LOCALE, isLocale } from '@/i18n/locales'
import { Link } from '@/i18n/navigation'

import { NAVIGATION } from '@/constant/navigation'

import { getUser } from '@/app/actions/static'

import { Box } from '@/components/Box'
import { Container } from '@/components/Container'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'

import { Languages } from './Languages'
import { Preferences } from './Preferences'
import type { HeaderProps } from './types'

import styles from './index.module.scss'

export const Header = async ({ theme }: HeaderProps) => {
  const [
    t,
    locale,
    user
  ] = await Promise.all([
    getTranslations('Workspace'),
    getLocale(),
    getUser(),
  ])
  const name = user?.user_metadata.full_name ?? user?.user_metadata.name
  const avatar = user?.user_metadata.avatar_url
  const account = user ? {
    name: typeof name === 'string' && name.trim() ? name : t('brand'),
    email: user.email ?? null,
    avatar: typeof avatar === 'string' ? avatar : null,
  } : null

  return (
    <Container
      as="header"
      display="flex"
      justify="between"
      align="center"
      gap={3}
      className={styles.block}
    >
      <Link
        href={NAVIGATION.home.url}
        className={styles.brand}
      >
        <Icon
          name="shopping-basket"
          className={styles.icon}
          size={28}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <Text
          as="span"
          size={5}
          weight="bold"
        >
          {t('brand')}
        </Text>
      </Link>
      <Box
        display="flex"
        align="center"
        gap={2}
      >
        <div className={styles.language}>
          <Suspense>
            <Languages />
          </Suspense>
        </div>
        <Preferences
          theme={theme}
          account={account}
          locale={isLocale(locale) ? locale : DEFAULT_LOCALE}
        />
      </Box>
    </Container>
  )
}
