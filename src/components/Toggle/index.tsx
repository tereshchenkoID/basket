'use client'

import clsx from 'clsx'

import { Text } from '@/components/Text'

import styles from './index.module.scss'

import type { ToggleProps } from '@/types/ui'

export const Toggle = ({
  label,
  error,
  className,
  ...props
}: ToggleProps) => (
  <label
    className={
      clsx(
        styles.block,
        {
          [styles.invalid]: error
        },
        className
      )
    }
  >
    <input
      {...props}
      className={styles.input}
      type="checkbox"
      role="switch"
      aria-invalid={error ? true : props['aria-invalid']}
    />
    <span
      className={styles.track}
      aria-hidden="true"
    >
      <span className={styles.thumb} />
    </span>
    {
      label &&
      <span className={styles.label}>{label}</span>
    }
    {
      error &&
      <Text
        as="span"
        size="sm"
        color="error"
        role="alert"
      >
        {error}
      </Text>
    }
  </label>
)
