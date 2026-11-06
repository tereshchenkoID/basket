'use client'

import { useModalStore } from '@/store/modal'

import { Action } from '@/components/Action'
import Icon from '@/components/Icon'

import type { ConfirmProps } from './types'

export const Confirm = ({
  label,
  confirmLabel,
  title,
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

  const handleClick = () => open({ name: 'confirm', title: title ?? label, props: { label: confirmLabel ?? label, description, onConfirm } })

  return (
    <Action
      variant={variant}
      iconOnly={iconOnly}
      aria-label={ariaLabel ?? (iconOnly ? label : undefined)}
      isLoading={isLoading}
      disabled={disabled}
      onClick={handleClick}
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
