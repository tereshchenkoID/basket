import { z } from 'zod'

import { VALIDATION_ERRORS } from '@/constant/errors'
import { REGEX } from '@/constant/regex'

export const UUID = z.uuid()

export const normalizedText = (max: number) => z
  .string()
  .transform(value => value.replace(REGEX.whitespace, ' ').trim())
  .pipe(
    z.string()
      .min(1, { error: VALIDATION_ERRORS.required })
      .max(max, { error: VALIDATION_ERRORS.maxLength }),
  )

export const validationError = (error: z.ZodError) => {
  const messages = Object.values(VALIDATION_ERRORS)
  const issue = error.issues[0]

  return messages.find(message => message === issue?.message) ?? 'invalid'
}
