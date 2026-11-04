'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'

import { logout } from '@/app/actions/auth'

import { Action } from '@/components/Action'
import { Text } from '@/components/Text'

import type { LogoutButtonProps } from '@/types/components'

export const LogoutButton = ({ locale }: LogoutButtonProps) => {
  const t = useTranslations('Auth')
  const [state, action, pending] = useActionState(logout.bind(null, locale), { error: false })

  return (
    <form action={action}>
      <Action
        type="submit"
        variant="secondary"
        isLoading={pending}
      >
        {
          !pending &&
          <LogOut
            size={16}
            aria-hidden="true"
          />
        }
        {pending ? t('loggingOut') : t('logout')}
      </Action>
      {
        state.error &&
        <Text
          size="sm"
          color="error"
          mt={3}
          role="alert"
        >
          {t('logoutError')}
        </Text>
      }
    </form>
  )
}
