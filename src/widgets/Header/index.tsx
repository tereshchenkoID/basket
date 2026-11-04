import { Suspense } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { ShoppingBasket } from 'lucide-react'

import { defaultLocale, isLocale } from '@/i18n/locales'
import { Link } from '@/i18n/navigation'

import { getUser } from '@/lib/auth/user'

import { Box } from '@/components/Box'
import { Text } from '@/components/Text'
import { LanguageSwitcher } from '@/widgets/Header/LanguageSwitcher'

import { Preferences } from './Preferences'

import styles from './index.module.scss'

import type { HeaderProps } from '@/types/components'

export const Header = async ({ theme }: HeaderProps) => {
  const t = await getTranslations('Common')
  const locale = await getLocale()
  const user = await getUser()
  const name = user?.user_metadata.full_name ?? user?.user_metadata.name
  const avatar = user?.user_metadata.avatar_url
  const account = user ? {
    name: typeof name === 'string' && name.trim() ? name : t('brand'),
    email: user.email ?? null,
    avatar: typeof avatar === 'string' ? avatar : null,
  } : null

  return (
    <Box
      as="header"
      container
      display="flex"
      justify="between"
      align="center"
      gap={3}
      className={styles.block}
    >
      <Link
        href="/"
        className={styles.brand}
      >
        <ShoppingBasket
          className={styles.icon}
          size={28}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <Text
          as="span"
          size="xl"
          weight={700}
        >
          {t('brand')}
        </Text>
        <Text
          as="span"
          className={styles.dot}
        >
          .
        </Text>
      </Link>
      <Box
        display="flex"
        align="center"
        gap={2}
      >
        <div className={styles.language}>
          <Suspense>
            <LanguageSwitcher />
          </Suspense>
        </div>
        <Preferences
          theme={theme}
          account={account}
          locale={isLocale(locale) ? locale : defaultLocale}
        />
      </Box>
    </Box>
  )
}
