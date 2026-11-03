import { z } from 'zod'

import { validationErrors } from '@/constant/errors'
import { regex } from '@/constant/regex'

export const uuid = z.uuid()

export const normalizedText = (max: number) => z
  .string()
  .transform(value => value.replace(regex.whitespace, ' ').trim())
  .pipe(
    z.string()
      .min(1, { error: validationErrors.required })
      .max(max, { error: validationErrors.maxLength }),
  )

export const validationError = (error: z.ZodError) => {
  const messages = Object.values(validationErrors)
  const issue = error.issues[0]

  return messages.find(message => message === issue?.message) ?? 'invalid'
}
