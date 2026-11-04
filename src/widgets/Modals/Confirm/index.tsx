'use client'

import { useModalStore } from '@/store/modal'

import { Action } from '@/components/Action'
import Icon from '@/components/Icon'

import type { ConfirmProps } from './types'

export const Confirm = ({
  label,
  ariaLabel,
  description,
  onConfirm,
  disabled,
  variant = 'secondary',
  icon,
  iconOnly,
  isLoading,
}: ConfirmProps) => {
  const open = useModalStore(state => state.open)

  return (
    <Action
      variant={variant}
      iconOnly={iconOnly}
      aria-label={ariaLabel ?? (iconOnly ? label : undefined)}
      isLoading={isLoading}
      disabled={disabled}
      onClick={() => open({ name: 'confirm', title: label, props: { label, description, onConfirm } })}
    >
      {
        icon &&
        <Icon
          name={icon}
          size={18}
          aria-hidden="true"
        />
      }
      {!iconOnly && label}
    </Action>
  )
}
