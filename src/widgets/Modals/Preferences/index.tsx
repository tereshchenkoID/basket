'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { THEMES } from '@/constant/theme'

import { useModalStore } from '@/store/modal'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'
import { Avatar } from '@/modules/Avatar'

import { Logout } from './Logout'
import { Theme } from './Theme'

import styles from './index.module.scss'

import type { PreferencesProps } from '@/types/components'

export const Preferences = ({ theme, account, locale }: PreferencesProps) => {
  const t = useTranslations('Workspace')
  const close = useModalStore(state => state.close)
  const [initialTheme] = useState(() => {
    const current = document.documentElement.dataset.theme

    return THEMES.find(value => value === current) ?? theme
  })

  return (
    <>
      {
        account &&
        <Grid
          gap={4}
          className={styles.account}
        >
          <Box
            display="flex"
            align="center"
            gap={3}
          >
            <Avatar
              name={account.name}
              url={account.avatar}
            />
            <Grid>
              <Text weight="semibold">{account.name}</Text>
              <Text
                size={2}
                color="muted"
              >
                {account.email}
              </Text>
            </Grid>
          </Box>
          <Action
            href="/dashboard"
            variant="secondary"
            onClick={close}
          >
            <Icon
              name="layout-dashboard"
              size={18}
              aria-hidden="true"
            />
            {t('dashboard')}
          </Action>
        </Grid>
      }
      {
        !account &&
        <Action
          href="/login"
          variant="secondary"
          onClick={close}
        >
          {t('signIn')}
        </Action>
      }
      <Grid gap={3}>
        <Heading
          as="h3"
          size={4}
        >
          {t('preferences')}
        </Heading>
        <Theme initialTheme={initialTheme} />
      </Grid>
      {
        account &&
        <Box
          mt="auto"
          className={styles.logout}
        >
          <Logout locale={locale} />
        </Box>
      }
    </>
  )
}
