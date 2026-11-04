'use client'

import clsx from 'clsx'

import { Text } from '@/components/Text'

import type { ToggleProps } from './types'

import styles from './index.module.scss'

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
        size={2}
        color="error"
        role="alert"
      >
        {error}
      </Text>
    }
  </label>
)
