import { DATABASE_ERROR_CODES, DATABASE_ERROR_MESSAGES } from '@/constant/errors'

import type { ActionError } from '@/types/action'
import type { DatabaseError } from '@/types/supabase'

export const databaseError = (error: DatabaseError): ActionError => {
  const message = Object.entries(DATABASE_ERROR_MESSAGES)
    .find(([value]) => error.message.includes(value))?.[1]
  const code = Object.entries(DATABASE_ERROR_CODES)
    .find(([value]) => value === error.code)?.[1]

  return message ?? code ?? 'unavailable'
}
