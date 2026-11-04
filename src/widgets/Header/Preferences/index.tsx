'use client'

import { useTranslations } from 'next-intl'

import { useModalStore } from '@/store/modal'

import { Action } from '@/components/Action'
import Icon from '@/components/Icon'

import type { PreferencesProps } from '@/types/components'

export const Preferences = (props: PreferencesProps) => {
  const t = useTranslations('Workspace')
  const open = useModalStore(state => state.open)
  const expanded = useModalStore(state => state.modal?.name === 'menu')

  return (
    <Action
      variant="secondary"
      iconOnly
      aria-label={t('menu')}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={() => open({ name: 'menu', title: t('menu'), props })}
    >
      <Icon
        name="menu"
        size={20}
        aria-hidden="true"
      />
    </Action>
  )
}
