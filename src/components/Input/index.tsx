'use client'

import { useId } from 'react'
import clsx from 'clsx'
import { LoaderCircle } from 'lucide-react'

import { Field } from '@/components/Field'

import styles from './index.module.scss'

import type { InputProps } from '@/types/ui'

export const Input = ({
  id,
  label,
  hint,
  error,
  isLoading,
  className,
  readOnly,
  size = 1,
  ...props
}: InputProps) => {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      className={className}
    >
      <div className={styles.control}>
        <input
          {...props}
          id={fieldId}
          size={size}
          readOnly={readOnly || isLoading}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={error || hint ? `${fieldId}-message` : props['aria-describedby']}
          aria-busy={isLoading || undefined}
          className={
            clsx(
              styles.field,
              {
                [styles.invalid]: error
              }
            )
          }
        />
        {
          isLoading &&
          <LoaderCircle
            className={styles.spinner}
            size={18}
            aria-hidden="true"
          />
        }
      </div>
    </Field>
  )
}
