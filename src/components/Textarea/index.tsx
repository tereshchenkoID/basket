'use client'

import { useId } from 'react'
import clsx from 'clsx'
import { LoaderCircle } from 'lucide-react'

import { Field } from '@/components/Field'

import styles from './index.module.scss'

import type { TextareaProps } from '@/types/ui'

export const Textarea = ({
  id,
  label,
  hint,
  error,
  isLoading,
  className,
  readOnly,
  rows = 4,
  cols = 1,
  ...props
}: TextareaProps) => {
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
        <textarea
          {...props}
          id={fieldId}
          rows={rows}
          cols={cols}
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
