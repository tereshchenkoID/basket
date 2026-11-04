'use client'

import clsx from 'clsx'
import { LoaderCircle } from 'lucide-react'

import { Link } from '@/i18n/navigation'

import styles from './index.module.scss'

import type { ActionProps } from '@/types/ui'

export const Action = (props: ActionProps) => {
  if (props.href !== undefined) {
    const {
      href,
      children,
      variant: _variant,
      isLoading,
      iconOnly: _iconOnly,
      className: _className,
      ...rest
    } = props

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
        aria-disabled={isLoading || rest['aria-disabled'] || undefined}
        tabIndex={isLoading ? -1 : rest.tabIndex}
        onClick={event => {
          if (isLoading || rest['aria-disabled'] === true || rest['aria-disabled'] === 'true') event.preventDefault()
          else rest.onClick?.(event)
        }}
      >
        {
          isLoading &&
          <LoaderCircle
            className={styles.spinner}
            size={18}
            aria-hidden="true"
          />
        }
        {children}
      </Link>
    )
  }

  const {
    children,
    variant: _variant,
    isLoading,
    iconOnly: _iconOnly,
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
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {
        isLoading &&
        <LoaderCircle
          className={styles.spinner}
          size={18}
          aria-hidden="true"
        />
      }
      {children}
    </button>
  )
}
