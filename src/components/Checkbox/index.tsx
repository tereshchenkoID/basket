'use client'

import clsx from 'clsx'
import { Check } from 'lucide-react'

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
      <Check
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
        size="sm"
        color="error"
        role="alert"
      >
        {error}
      </Text>
    }
  </label>
)
