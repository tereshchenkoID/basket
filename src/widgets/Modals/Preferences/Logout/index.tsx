'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'

import { logout } from '@/app/actions/auth'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'

import type { LogoutProps } from './types'

export const Logout = ({ locale }: LogoutProps) => {
  const t = useTranslations('Workspace.auth')
  const [state, action, pending] = useActionState(logout.bind(null, locale), { error: false })

  return (
    <Grid
      as="form"
      action={action}
    >
      <Action
        type="submit"
        variant="danger"
        isLoading={pending}
      >
        {
          !pending &&
          <Icon
            name="log-out"
            size={16}
            aria-hidden="true"
          />
        }
        {
          t(pending ? 'loggingOut' : 'logout')
        }
      </Action>
      {
        state.error &&
        <Text
          size={2}
          color="error"
          mt={3}
          role="alert"
        >
          {t('logoutError')}
        </Text>
      }
    </Grid>
  )
}
