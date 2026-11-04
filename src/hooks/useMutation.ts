import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslations } from 'next-intl'

import type { ActionError, ActionResult } from '@/types/action'

export const useMutation = (successMessage?: string) => {
  const t = useTranslations('Workspace')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ActionError | null>(null)
  const [success, setSuccess] = useState(false)
  const lock = useRef(false)
  const operationId = useRef<string | null>(null)

  const execute = async <T,>(operation: (id: string) => Promise<ActionResult<T>>) => {
    if (lock.current) return

    lock.current = true
    operationId.current ??= crypto.randomUUID()
    setPending(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await operation(operationId.current)

      if (!result.ok) {
        setError(result.error)
        toast.error(t(`errors.${result.error}`))

        return
      }

      operationId.current = null
      setSuccess(true)
      toast.success(successMessage ?? t('completed'))

      return result
    } catch {
      // Retain the UUID so a retry cannot duplicate a successful remote insert.
      setError('unavailable')
      toast.error(t('errors.unavailable'))
    } finally {
      lock.current = false
      setPending(false)
    }
  }

  return {
    execute,
    pending,
    error,
    success,
  }
}
