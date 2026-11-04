import { databaseErrorCodes, databaseErrorMessages } from '@/constant/errors'

import type { ActionError } from '@/types/action'
import type { DatabaseError } from '@/types/supabase'

export const databaseError = (error: DatabaseError): ActionError => {
  const message = Object.entries(databaseErrorMessages)
    .find(([value]) => error.message.includes(value))?.[1]
  const code = Object.entries(databaseErrorCodes)
    .find(([value]) => value === error.code)?.[1]

  return message ?? code ?? 'unavailable'
}
