'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { NAVIGATION, ROUTES_USER } from '@/constant/navigation'
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
  const handleClose = useModalStore(state => state.close)
  const [initialTheme] = useState(() => {
    const current = document.documentElement.dataset.theme

    return THEMES.find(value => value === current) ?? theme
  })

  return (
    <>
      {
        account &&
        <Grid
          gap={2}
          className={styles.account}
        >
          <Box
            display="flex"
            align="center"
            gap={2}
            mb={2}
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
            href={ROUTES_USER.dashboard.url}
            variant="secondary"
            onClick={handleClose}
            className={styles.action}
          >
            <Icon
              name={ROUTES_USER.dashboard.icon}
              size={18}
              aria-hidden="true"
            />
            {t(ROUTES_USER.dashboard.text)}
          </Action>
          {
            [ROUTES_USER.scan, ROUTES_USER.history].map(route =>
              <Action
                key={route.url}
                href={route.url}
                variant="secondary"
                onClick={handleClose}
                className={styles.action}
              >
                <Icon
                  name={route.icon}
                  size={18}
                  aria-hidden="true"
                />
                {t(route.text)}
              </Action>
            )
          }
        </Grid>
      }
      {
        !account &&
        <Action
          href={NAVIGATION.login.url}
          variant="secondary"
          onClick={handleClose}
        >
          {t(NAVIGATION.login.text)}
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
