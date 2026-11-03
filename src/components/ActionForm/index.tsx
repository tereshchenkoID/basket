'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import styles from './index.module.scss'

import type { ActionResult } from '@/types/action'

type ActionFormProps<T> = {
  children?: React.ReactNode
  label: string
  operation: (form: FormData, operationId: string) => Promise<ActionResult<T>>
  onSuccess?: (data: T) => void
  reset?: boolean
  compact?: boolean
}

export const ActionForm = <T,>({
  children,
  label,
  operation,
  onSuccess,
  reset,
  compact,
}: ActionFormProps<T>) => {
  const t = useTranslations('Workspace')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lockRef = useRef(false)
  const operationIdRef = useRef<string | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (lockRef.current) return

    lockRef.current = true
    const form = event.currentTarget
    const data = new FormData(form)
    operationIdRef.current ??= crypto.randomUUID()
    setPending(true)
    setError(null)

    try {
      const result = await operation(data, operationIdRef.current)

      if (result.ok) {
        operationIdRef.current = null

        if (reset) {
          form.reset()
          const input = form.elements.namedItem('name')

          if (input instanceof HTMLInputElement) input.focus({ preventScroll: true })
        }

        onSuccess?.(result.data)
      } else {
        setError(t(`errors.${result.error}`))
      }
    } catch {
      // Keep the operation UUID on ambiguous transport failure; retries are idempotent.
      setError(t('errors.unavailable'))
    } finally {
      lockRef.current = false
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className={compact ? styles.compact : styles.form} aria-busy={pending}>
      <fieldset disabled={pending}>
        {children}
        <button type="submit">{pending ? t('saving') : label}</button>
      </fieldset>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
