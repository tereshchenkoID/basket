'use client'

import clsx from 'clsx'

import Icon from '@/components/Icon'
import { Text } from '@/components/Text'

import styles from './index.module.scss'

import type { CheckboxProps } from '@/types/ui'

export const Checkbox = ({
  label,
  error,
  className,
  ...props
}: CheckboxProps) => (
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
      aria-invalid={error ? true : props['aria-invalid']}
    />
    <span
      className={styles.control}
      aria-hidden="true"
    >
      <Icon
        name="check"
        className={styles.check}
        size={16}
      />
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
