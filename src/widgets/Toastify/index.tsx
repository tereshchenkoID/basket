'use client'

import type { CloseButtonProps, IconProps } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import { useTranslations } from 'next-intl'

import { Action } from '@/components/Action'
import Icon from '@/components/Icon'

import styles from './index.module.scss'

const TOAST_ICONS = {
  success: 'circle-check',
  error: 'circle-alert',
  warning: 'triangle-alert',
  info: 'info',
  default: 'info',
} as const

export const Toastify = () => {
  const t = useTranslations('Workspace')

  const renderIcon = ({ type }: IconProps) => (
    <Icon
      name={TOAST_ICONS[type]}
      size={22}
      color={type === 'error' ? 'var(--danger)' : 'var(--primary)'}
      aria-hidden="true"
    />
  )

  const renderClose = ({ closeToast: handleClose }: CloseButtonProps) => (
    <Action
      className={styles.close}
      variant="ghost"
      iconOnly
      aria-label={t('close')}
      onClick={handleClose}
    >
      <Icon
        name="x"
        size={18}
        aria-hidden="true"
      />
    </Action>
  )

  return (
    <ToastContainer
      aria-label={t('notifications')}
      position="top-right"
      autoClose={4000}
      limit={3}
      className={styles.block}
      toastClassName={styles.toast}
      pauseOnHover
      pauseOnFocusLoss
      icon={renderIcon}
      closeButton={renderClose}
    />
  )
}
