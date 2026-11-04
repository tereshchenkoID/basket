'use client'

import clsx from 'clsx'

import { Link } from '@/i18n/navigation'

import Icon from '@/components/Icon'

import type { ActionProps } from './types'

import styles from './index.module.scss'

export const Action = (props: ActionProps) => {
  if (props.href !== undefined) {
    const {
      href,
      children,
      variant: _variant,
      isLoading,
      iconOnly,
      className: _className,
      ...rest
    } = props

    const unavailable = isLoading || rest['aria-disabled'] === true || rest['aria-disabled'] === 'true'

    return (
      <Link
        {...rest}
        href={href}
        className={
          clsx(
            styles.block,
            styles[props.variant ?? 'primary'],
            {
              [styles.icon]: props.iconOnly
            },
            props.className
          )
        }
        aria-busy={isLoading || undefined}
        aria-disabled={unavailable || undefined}
        tabIndex={unavailable ? -1 : rest.tabIndex}
        onClick={event => {
          if (unavailable) {
            event.preventDefault()
            event.stopPropagation()
          }
          else rest.onClick?.(event)
        }}
      >
        {
          isLoading &&
          <Icon
            name="loader-circle"
            className={styles.spinner}
            size={18}
            aria-hidden="true"
          />
        }
        {!(isLoading && iconOnly) && children}
      </Link>
    )
  }

  const {
    children,
    variant: _variant,
    isLoading,
    iconOnly,
    className: _className,
    type = 'button',
    disabled,
    ...rest
  } = props

  return (
    <button
      {...rest}
      type={type}
      className={
        clsx(
          styles.block,
          styles[props.variant ?? 'primary'],
          {
            [styles.icon]: props.iconOnly
          },
          props.className
        )
      }
      disabled={disabled || isLoading || rest['aria-disabled'] === true || rest['aria-disabled'] === 'true'}
      aria-busy={isLoading || undefined}
    >
      {
        isLoading &&
        <Icon
          name="loader-circle"
          className={styles.spinner}
          size={18}
          aria-hidden="true"
        />
      }
      {!(isLoading && iconOnly) && children}
    </button>
  )
}
